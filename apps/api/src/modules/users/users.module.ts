import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';

// UsersModule — owns the User entity and its repository (Feature 2 will
// grow the CRUD surface here). AuthModule imports this module to reach
// the repository — the owner-of-record pattern from architecture.md:
// cross-module needs go through the owning module, never a foreign repo.
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}