import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestAppointment } from '../entities/test-appointment.entity';

// TestAppointmentsRepository — the testing domain's data access layer
// (build-plan.md § 5.1). Extends Repository (PeopleRepository/
// LocalLicenseApplicationsRepository pattern); pure TypeORM calls only —
// business rules (sequencing, locking, fee snapshots) live in the service.
// No TestsRepository exists: the Tests row is written inside the service's
// transaction via the manager (Application-parent precedent, Session 12).
@Injectable()
export class TestAppointmentsRepository extends Repository<TestAppointment> {
  constructor(
    @InjectRepository(TestAppointment)
    private readonly appointmentRepo: Repository<TestAppointment>,
  ) {
    // STEP 1: Expose the decorated repository as the inherited base so
    //         callers get the full TypeORM Repository surface plus the
    //         custom methods below.
    super(appointmentRepo.target, appointmentRepo.manager);
  }

  // Every read joins the stage (testType) and the recorded outcome (test,
  // null while the slot is still open) — the DTOs need testTypeTitle and
  // the result on all return paths, so the join is always-on.
  private joinedQb() {
    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.testType', 'testType')
      .leftJoinAndSelect('appointment.test', 'test');
  }

  // Single appointment with the full join set — recordResult's guard +
  // reload path, and the per-slot projection source. Returns null so the
  // service decides the 404.
  async findById(id: number): Promise<TestAppointment | null> {
    return this.joinedQb().where('appointment.id = :id', { id }).getOne();
  }

  // Every appointment of one application, newest first — the pipeline's
  // history list, and the single read schedule()/getPipeline() derive all
  // stage state from (no per-stage query fan-out).
  async findAllForApplication(llaId: number): Promise<TestAppointment[]> {
    // STEP 1: Filter by the owning application; id DESC = most recently
    //         booked first, matching the "Appointment History, newest
    //         first" requirement.
    return this.joinedQb()
      .where('appointment.llaId = :llaId', { llaId })
      .orderBy('appointment.id', 'DESC')
      .getMany();
  }

  // An open (unlocked) slot for a given stage — the double-scheduling guard
  // (a stage may hold at most one pending booking; invariant #21's
  // brand-new-retake rule is the ONLY way a second one appears, after the
  // first is locked with a result).
  async findUnlockedForStage(
    llaId: number,
    testTypeId: number,
  ): Promise<TestAppointment | null> {
    return this.findOneBy({ llaId, testTypeId, isLocked: false });
  }

  // The irreversible lock flip (invariant #20) — called ONLY by
  // recordResult, inside the same transaction that writes the Tests row.
  async updateIsLocked(id: number): Promise<void> {
    await this.manager.update(TestAppointment, { id }, { isLocked: true });
  }
}