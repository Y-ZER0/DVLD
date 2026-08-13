import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PeopleModule } from '../people/people.module';

// UsersModule — owns the User entity, its repository, and the account
// CRUD service/controller (build-plan.md § 2.1). AuthModule imports this
// module for UsersRepository (the login path's only access point);
// UsersModule imports PeopleModule because UsersService reaches the
// people domain through its exported service — never a foreign
// repository (architecture.md § System Boundaries, owner-of-record).
@Module({
  imports: [TypeOrmModule.forFeature([User]), PeopleModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}