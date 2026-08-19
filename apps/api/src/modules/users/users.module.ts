import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PeopleModule } from '../people/people.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PeopleModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}