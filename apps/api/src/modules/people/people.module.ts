import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { PeopleRepository } from './repositories/people.repository';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

// PeopleModule — owns the Person entity, its repository, and the citizen
// registry CRUD service/controller (build-plan.md § 1.1). AuthModule imports
// this module for the Person entity registration only; UsersModule imports
// it for PeopleService (the "person exists / already linked" checks in
// UsersService) — cross-module needs always go through the exported
// service (architecture.md § System Boundaries, owner-of-record pattern).
@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  controllers: [PeopleController],
  providers: [PeopleService, PeopleRepository],
  exports: [PeopleService],
})
export class PeopleModule {}