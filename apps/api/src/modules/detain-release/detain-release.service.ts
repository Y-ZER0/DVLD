import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  ApplicationStatus,
  ApplicationType,
  ApplicationTypeDto,
  DetentionRegisterRowDto,
  EligibleLicenseForDetentionDto,
} from '@repo/shared';
import { LocalLicenseApplicationsService } from '../local-license-applications/local-license-applications.service';
import { LookupService } from '../lookup/lookup.service';
import { LicensesService } from '../licenses/licenses.service';
import { DetainedLicense } from './entities/detained-license.entity';
import {
  DetainedLicensesRepository,
  PaginatedDetentions,
} from './repositories/detained-licenses.repository';
import { DetainLicenseRequestDto } from './dtos/detain-license-request.dto';

// DetainReleaseService — the detention workflow (Feature 9.1): detaining
// records a fine and locks the license; releasing only ever happens through
// a ReleaseDetainedLicense application (invariant #27), never a flag toggle.
@Injectable()
export class DetainReleaseService {
  constructor(
    private readonly detainedLicensesRepo: DetainedLicensesRepository,
    @Inject(forwardRef(() => LicensesService))
    private readonly licensesService: LicensesService,
    private readonly appsService: LocalLicenseApplicationsService,
    private readonly lookupService: LookupService,
    private readonly dataSource: DataSource,
  ) {}

  // True when the license has an unreleased detention; runs on the caller's
  // manager so renewal/replacement checks it inside their transaction
  // (invariant #32 — a detained license can't be renewed or replaced).
  async hasOpenDetention(
    manager: EntityManager,
    licenseId: number,
  ): Promise<boolean> {
    const detention = await manager.findOne(DetainedLicense, {
      where: { licenseId, isReleased: false },
    });
    return detention !== null;
  }

  // Register projection adds the display-only totalDue (fine + live release
  // fee) — never persisted, since the release fee is only snapshotted at
  // release time (build-plan § 9.1).
  private toDto(
    detention: DetainedLicense,
    releaseFee: string,
  ): DetentionRegisterRowDto {
    return {
      id: detention.id,
      licenseId: detention.licenseId,
      driverId: detention.license.driver.id,
      driverName: `${detention.license.driver.person.firstName} ${detention.license.driver.person.lastName}`,
      nationalNumber: detention.license.driver.person.nationalNumber,
      detainDate: detention.detainDate.toISOString(),
      fineFees: detention.fineFees,
      isReleased: detention.isReleased,
      releaseDate: detention.releaseDate?.toISOString() ?? null,
      totalDue: (
        parseFloat(detention.fineFees) + Number(releaseFee)
      ).toFixed(2),
    };
  }

  // Paginated detention register, newest first — the 9.2 register table's
  // source; released rows stay for the audit trail (Feature 10 reuse).
  async findRegister(
    page: number,
    pageSize: number,
  ): Promise<{ data: DetentionRegisterRowDto[]; meta: PaginatedDetentions['meta'] }> {
    const releaseFee = (await this.fetchReleaseApplicationType())
      .applicationFees;
    const { data, meta } =
      await this.detainedLicensesRepo.findAllForRegister(page, pageSize);
    return {
      data: data.map((detention) => this.toDto(detention, releaseFee)),
      meta,
    };
  }

  // Active licenses with no open detention — the 9.2 picker's feed; the
  // licenses domain owns the read, this service maps the rows to the DTO.
  async findEligible(
    page: number,
    pageSize: number,
  ): Promise<{
    data: EligibleLicenseForDetentionDto[];
    meta: { total: number; page: number; pageSize: number };
  }> {
    const { data, meta } = await this.licensesService.findEligibleForDetention(
      page,
      pageSize,
    );
    return {
      data: data.map((license) => ({
        licenseId: license.id,
        driverName: `${license.driver.person.firstName} ${license.driver.person.lastName}`,
        nationalNumber: license.driver.person.nationalNumber,
        className: license.licenseClass.className,
      })),
      meta,
    };
  }

  // Detains a license: 404/409 guards and the insert run in ONE transaction
  // (activity must exist before its fine is recorded — no half writes).
  async detainLicense(
    dto: DetainLicenseRequestDto,
    actingUserId: number,
  ): Promise<DetentionRegisterRowDto> {
    // Resolved before the write so a missing release type never leaves a
    // committed detention behind a 404 (8.1 fee-source precedent).
    const releaseFee = (await this.fetchReleaseApplicationType())
      .applicationFees;

    const saved = await this.dataSource.transaction(async (manager) => {
      // The target license must exist and be active — the picker only offers
      // eligible rows, but the guard never trusts the UI to have filtered.
      const license = await this.licensesService.findLicenseOnManager(
        manager,
        dto.licenseId,
      );
      if (!license) {
        throw new NotFoundException('License not found');
      }
      if (!license.isActive) {
        throw new ConflictException('Only an active license can be detained');
      }

      // No double-detaining: a license with an open detention is rejected.
      const openDetention = await manager.findOne(DetainedLicense, {
        where: { licenseId: dto.licenseId, isReleased: false },
      });
      if (openDetention) {
        throw new ConflictException('License is already detained');
      }

      return manager.save(
        manager.create(DetainedLicense, {
          licenseId: dto.licenseId,
          detainDate: new Date(),
          fineFees: dto.fineFees.toFixed(2),
          createdByUserId: actingUserId,
          isReleased: false,
        }),
      );
    });

    // Reload with the join set — the insert can't populate the relations.
    const reloaded = await this.detainedLicensesRepo.findById(saved.id);
    return this.toDto(reloaded!, releaseFee);
  }

  // Releases a detention through a ReleaseDetainedLicense application
  // (invariant #27): the application is created and the detention flipped in
  // one transaction — no other code path may set IsReleased = true.
  async releaseLicense(
    detainId: number,
    actingUserId: number,
  ): Promise<DetentionRegisterRowDto> {
    // The detention must exist (404) and still be open (409).
    const detention = await this.detainedLicensesRepo.findById(detainId);
    if (!detention) {
      throw new NotFoundException('Detention record not found');
    }
    if (detention.isReleased) {
      throw new ConflictException('License was already released');
    }

    // The fee source: the seeded Release Detained application type (never
    // from the client, snapshot at write time — invariant #28).
    const applicationType = await this.fetchReleaseApplicationType();

    await this.dataSource.transaction(async (manager) => {
      // The application row rides this transaction; it resolves as Completed
      // the moment the release happens (7.1 renewal precedent). The release
      // fee is snapshotted here — totalDue on the register was display-only.
      const application = await this.appsService.createInTransaction(manager, {
        applicantPersonId: detention.license.driver.person.id,
        applicationTypeId: applicationType.id,
        applicationStatus: ApplicationStatus.COMPLETED,
        paidFees: applicationType.applicationFees,
        createdByUserId: actingUserId,
      });

      // The WHERE IsReleased guard makes a concurrent release hit 0 rows here
      // instead of double-releasing (7.1 race-guard pattern).
      const updated = await manager.update(
        DetainedLicense,
        { id: detainId, isReleased: false },
        {
          isReleased: true,
          releaseDate: new Date(),
          releasedByUserId: actingUserId,
          releaseApplicationId: application.id,
        },
      );
      if (updated.affected !== 1) {
        throw new ConflictException('Detention was already released');
      }
    });

    // Reload with the join set — the update can't populate the relations.
    const reloaded = await this.detainedLicensesRepo.findById(detainId);
    return this.toDto(reloaded!, applicationType.applicationFees);
  }

  // Resolves the release application type; a vanished row is a configuration
  // failure, not a silent no-op (the fee snapshot depends on it).
  private async fetchReleaseApplicationType(): Promise<ApplicationTypeDto> {
    const applicationType =
      await this.lookupService.findApplicationTypeByTitle(
        ApplicationType.RELEASE_DETAINED_LICENSE,
      );
    if (!applicationType) {
      throw new NotFoundException(
        'Release Detained License application type is not configured',
      );
    }
    return applicationType;
  }
}