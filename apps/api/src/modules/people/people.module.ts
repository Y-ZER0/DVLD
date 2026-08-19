import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { PeopleRepository } from './repositories/people.repository';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  controllers: [PeopleController],
  providers: [PeopleService, PeopleRepository],
  exports: [PeopleService],
})
export class PeopleModule {}