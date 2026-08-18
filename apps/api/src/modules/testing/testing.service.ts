import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import {
  ApplicationStatus,
  TestAppointmentDto,
  TestPipelineDto,
  TestStageDto,
  TestStageStatus,
} from '@repo/shared';
import { LocalLicenseApplicationsService } from '../local-license-applications/local-license-applications.service';
import { LookupService } from '../lookup/lookup.service';
import { TestAppointment } from './entities/test-appointment.entity';
import { Test } from './entities/test.entity';
import { TestAppointmentsRepository } from './repositories/test-appointments.repository';
import { ScheduleTestAppointmentRequestDto } from './dtos/schedule-test-appointment-request.dto';
import { RecordTestResultRequestDto } from './dtos/record-test-result-request.dto';

// TestingService — the sequencing heart of the whole system (build-plan.md
// § 5.1): exactly three stages per application in strict Vision → Written →
// Street order (invariant #19), bookings fee-snapshotted at schedule time
// (invariant #28), results recorded once and locked forever (invariant
// #20), failures forcing a brand-new appointment for the same stage
// (invariant #21). Entities never leave this module (invariant #11); the
// pipeline projection is the read surface 5.2's stepper + history consume.
@Injectable()
export class TestingService {
  constructor(
    private readonly appsRepo: TestAppointmentsRepository,
    private readonly appsService: LocalLicenseApplicationsService,
    private readonly lookupService: LookupService,
    private readonly dataSource: DataSource,
  ) {}

  // Projects a joined appointment into the shared flat DTO — the only shape
  // that crosses the API boundary. The testType join feeds the title; the
  // test join (present once a result exists) feeds the verdict.
  private toDto(a: TestAppointment): TestAppointmentDto {
    return {
      id: a.id,
      testTypeId: a.testTypeId,
      testTypeTitle: a.testType.testTypeTitle,
      localDrivingLicenseApplicationId: a.llaId,
      appointmentDate: a.appointmentDate.toISOString(),
      paidFees: a.paidFees,
      isLocked: a.isLocked,
      test: a.test
        ? { id: a.test.id, result: a.test.testResult, notes: a.test.notes }
        : null,
    };
  }

  // Books a slot for one stage of an application. The stage's position in
  // the seeded TestTypes order decides whether a predecessor gate applies
  // (invariant #19); the fee is snapshotted from the current lookup row
  // (invariant #28); the booking clerk comes from the session (invariant
  // #29). One-row insert — no transaction needed.
  async schedule(
    llaId: number,
    dto: ScheduleTestAppointmentRequestDto,
    actingUserId: number,
  ): Promise<TestAppointmentDto> {
    // STEP 1: The application must exist — reusing
    //         LocalLicenseApplicationsService keeps the module boundary
    //         (cross-module reads go through its exported service) and
    //         reuses its 404 semantics.
    const application = await this.appsService.findOne(llaId);

    // STEP 2: No test activity on a dead application — Cancelled is a
    //         one-way door (Feature 4) and Completed means the license was
    //         already issued (Feature 6); booking tests for either is a
    //         client mistake, surfaced as 409 rather than a silent write.
    if (application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Cannot schedule tests for a ${application.applicationStatus} application`,
      );
    }

    // STEP 3: The stage must exist — its row is also the fee snapshot
    //         source below (invariant #28); an unknown id stops here as a
    //         clean 404 rather than a later null dereference.
    const testType = await this.lookupService.findTestTypeById(dto.testTypeId);
    if (!testType) {
      throw new NotFoundException('Test type not found');
    }

    // STEP 4: Double-scheduling guard — a stage may hold at most ONE open
    //         (unlocked) slot. Two pending bookings for the same stage
    //         would make the pipeline ambiguous, so the second attempt is
    //         409 (a new slot only becomes legal after the first is locked
    //         with a result — invariant #21's retake path).
    const existing = await this.appsRepo.findUnlockedForStage(
      llaId,
      testType.id,
    );
    if (existing) {
      throw new ConflictException(
        `A ${testType.testTypeTitle} appointment is already scheduled for this application`,
      );
    }

    // STEP 5: Sequencing gates (invariant #19) — one history read serves
    //         both: (a) an ALREADY-PASSED stage can never be booked again —
    //         a passed stage stays passed forever, so a new booking would
    //         be a phantom row in history under a Passed stage; (b) every
    //         stage beyond the first requires its predecessor to have a
    //         passed result on record. Both re-checked server-side, never
    //         trusted from the UI.
    const stageOrder = await this.lookupService.findAllTestTypes();
    const positionIndex = stageOrder.findIndex((t) => t.id === testType.id);
    if (positionIndex === -1) {
      // The id resolves to a row outside the seeded sequence — config
      // drift; fail loud rather than inventing an order position.
      throw new ConflictException(
        `Test type ${testType.testTypeTitle} is not part of the test sequence`,
      );
    }
    const history = await this.appsRepo.findAllForApplication(llaId);
    if (
      history.some(
        (a) => a.testTypeId === testType.id && a.test?.testResult === true,
      )
    ) {
      throw new ConflictException(
        `The ${testType.testTypeTitle} test has already been passed`,
      );
    }
    if (positionIndex > 0) {
      const predecessor = stageOrder[positionIndex - 1];
      // A stage inside the register always has a predecessor at index-1;
      // the guard keeps the compiler (noUncheckedIndexedAccess) honest
      // against a drift-shaped register.
      if (!predecessor) {
        throw new ConflictException(
          `Test type ${testType.testTypeTitle} has no configured predecessor`,
        );
      }
      const predecessorPassed = history.some(
        (a) => a.testTypeId === predecessor.id && a.test?.testResult === true,
      );
      if (!predecessorPassed) {
        throw new ConflictException(
          `Cannot schedule ${testType.testTypeTitle} before ${predecessor.testTypeTitle} has been passed`,
        );
      }
    }

    // STEP 6: Insert the slot — fee snapshotted from TestTypes.TestTypeFees
    //         at booking time (invariant #28), IsLocked false, the session
    //         user recorded (invariant #29). isLocked is never accepted
    //         from the client; isLocked: false here is explicit so a future
    //         refactor can't default it to a stale value.
    const saved = await this.appsRepo.save(
      this.appsRepo.create({
        testTypeId: testType.id,
        llaId,
        appointmentDate: new Date(dto.appointmentDate),
        paidFees: testType.testTypeFees,
        createdByUserId: actingUserId,
        isLocked: false,
      }),
    );

    // STEP 7: Reload with the join set — the insert can't populate the
    //         relations, and toDto needs them (Session 12 reload pattern).
    return this.toDto((await this.appsRepo.findById(saved.id))!);
  }

  // Records the Pass/Fail verdict against one appointment and permanently
  // locks that appointment, per invariants #20/#21. The Tests insert and
  // the lock flip are ONE transaction (code-standards § 4) — a crash in
  // between must never leave a recorded result on an unlocked slot.
  async recordResult(
    appointmentId: number,
    dto: RecordTestResultRequestDto,
    actingUserId: number,
  ): Promise<TestAppointmentDto> {
    // STEP 1: Load the appointment first. We cannot record a result for an
    //         appointment that doesn't exist, and its lock state + owning
    //         application drive every guard below.
    const appointment = await this.appsRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Test appointment not found');
    }

    // STEP 2: The owning application must still be alive — recording a
    //         result into a Cancelled/Completed application's pipeline is
    //         the same one-way-door violation schedule() guards (the FK
    //         guarantees the application exists; only its status matters).
    const application = await this.appsService.findOne(appointment.llaId);
    if (application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Cannot record results for a ${application.applicationStatus} application`,
      );
    }

    // STEP 3: Guard against double-recording (invariant #20). A locked
    //         appointment's result is a permanent audit fact — it must
    //         never be silently overwritten by a retried request.
    if (appointment.isLocked) {
      throw new ConflictException('This appointment is already locked');
    }

    // STEP 4: Persist the verdict AND flip the lock in one transaction —
    //         the two writes must never exist apart (code-standards § 4).
    //         The Tests row is what the rest of the app reads to decide
    //         whether the pipeline can advance; locking is what makes that
    //         decision permanent.
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(
          manager.create(Test, {
            appointmentId: appointment.id,
            testResult: dto.result === 'passed',
            notes: dto.notes ?? null,
            createdByUserId: actingUserId,
          }),
        );
        await manager.update(
          TestAppointment,
          { id: appointment.id },
          { isLocked: true },
        );
      });
    } catch (error) {
      // A concurrent recordResult that slipped past the lock check will
      // collide with the unique TestAppointmentID on Tests — surface that
      // race as the same 409 the normal path returns (23505→409 precedent,
      // Session 6's 23503→409 delete guard).
      if (
        error instanceof QueryFailedError &&
        (error as { driverError?: { code?: string } }).driverError?.code ===
          '23505'
      ) {
        throw new ConflictException('This appointment is already locked');
      }
      throw error;
    }

    // STEP 5: Reload and project. If the applicant failed, we deliberately
    //         do nothing further here — the pipeline does not advance, and
    //         the "Schedule" action for this same stage reappears on the
    //         next read because a fresh appointment (invariant #21) is
    //         required.
    return this.toDto((await this.appsRepo.findById(appointment.id))!);
  }

  // Computes the pipeline state for the detail page's right-hand column:
  // one read of every appointment (joined), from which the three stage
  // states (Passed/Schedule/Scheduled/Locked, Session 14 spec) and the
  // appointment history are derived. 404 when the application doesn't exist.
  async getPipeline(llaId: number): Promise<TestPipelineDto> {
    // STEP 1: The pipeline is meaningless for an unknown application — the
    //         404 comes from the applications service (module boundary).
    await this.appsService.findOne(llaId);

    // STEP 2: One query for everything — no per-stage fan-out. The list is
    //         newest-first, so for each stage the first row IS its latest
    //         appointment.
    const appointments = await this.appsRepo.findAllForApplication(llaId);

    // STEP 3: Project the three stages in the seeded Vision → Written →
    //         Street order (invariant #19). EXACTLY four states (Session 14
    //         user spec — no Failed/Pending on the stages section): a stage
    //         with any recorded true result is 'Passed' forever; the first
    //         not-yet-passed stage is the CURRENT one — 'Scheduled' while it
    //         holds an open (unlocked) booking, 'Schedule' otherwise (a
    //         failed attempt never gets its own state — it just keeps the
    //         stage on 'Schedule' until retaken, invariant #21); every
    //         stage beyond the current one is 'Locked' (grayed out until
    //         its predecessor passes).
    const stageOrder = await this.lookupService.findAllTestTypes();
    const passedByType = new Set(
      appointments
        .filter((a) => a.test?.testResult === true)
        .map((a) => a.testTypeId),
    );
    const currentIndex = stageOrder.findIndex((t) => !passedByType.has(t.id));
    const stages: TestStageDto[] = stageOrder.map((tt, index) => {
      const latest =
        appointments.find((a) => a.testTypeId === tt.id) ?? null;
      let status: TestStageStatus;
      if (passedByType.has(tt.id)) {
        // A passed stage is passed forever — the pipeline cannot un-pass.
        status = 'Passed';
      } else if (index === currentIndex) {
        // The current stage is 'Scheduled' only while an open booking
        // exists; a locked slot (failed result) or no slot at all falls
        // back to 'Schedule' — the retake path (invariant #21).
        status = latest && !latest.isLocked ? 'Scheduled' : 'Schedule';
      } else {
        // Future stage — unreachable until the predecessor passes; the
        // 5.2 stepper renders it grayed with a lock icon.
        status = 'Locked';
      }
      return {
        testTypeId: tt.id,
        title: tt.testTypeTitle,
        description: tt.testTypeDescription,
        status,
        appointmentId: latest?.id ?? null,
        appointmentDate: latest ? latest.appointmentDate.toISOString() : null,
        paidFees: latest?.paidFees ?? null,
        testResult: latest?.test?.testResult ?? null,
        notes: latest?.test?.notes ?? null,
      };
    });

    // STEP 4: History — every appointment, newest first (the repository's
    //         order), projected through the same toDto gate (invariant #11).
    return {
      applicationId: llaId,
      stages,
      history: appointments.map((a) => this.toDto(a)),
    };
  }
}