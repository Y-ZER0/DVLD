import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';

// PeopleModule — owns the Person entity's registration. Schema-only shell
// for now: Feature 1 adds the repository/service/controller on top of the
// already-existing entity. Registration here is what makes the entity
// visible to the global connection (autoLoadEntities + the relation the
// User entity declares).
@Module({
  imports: [TypeOrmModule.forFeature([Person])],
})
export class PeopleModule {}