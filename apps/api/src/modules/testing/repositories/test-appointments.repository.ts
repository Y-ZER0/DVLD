import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestAppointment } from '../entities/test-appointment.entity';

// TestAppointmentsRepository — the testing domain's data access layer.
@Injectable()
export class TestAppointmentsRepository extends Repository<TestAppointment> {
  constructor(
    @InjectRepository(TestAppointment)
    private readonly appointmentRepo: Repository<TestAppointment>,
  ) {
    super(appointmentRepo.target, appointmentRepo.manager);
  }

  // Every read joins the stage (testType) and the recorded outcome (test,
  // null while the slot is still open) — the DTOs need them on all return paths.
  private joinedQb() {
    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.testType', 'testType')
      .leftJoinAndSelect('appointment.test', 'test');
  }

  // Single appointment with the full join set; null when missing.
  async findById(id: number): Promise<TestAppointment | null> {
    return this.joinedQb().where('appointment.id = :id', { id }).getOne();
  }

  // Every appointment of one application, newest first — the pipeline's
  // history list and the single read schedule()/getPipeline() derive from.
  async findAllForApplication(llaId: number): Promise<TestAppointment[]> {
    return this.joinedQb()
      .where('appointment.llaId = :llaId', { llaId })
      .orderBy('appointment.id', 'DESC')
      .getMany();
  }

  // An open (unlocked) slot for a given stage — the double-scheduling guard.
  async findUnlockedForStage(
    llaId: number,
    testTypeId: number,
  ): Promise<TestAppointment | null> {
    return this.findOneBy({ llaId, testTypeId, isLocked: false });
  }

  // Irreversible lock flip; called only by recordResult, inside its transaction.
  async updateIsLocked(id: number): Promise<void> {
    await this.manager.update(TestAppointment, { id }, { isLocked: true });
  }
}