import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserDto } from '@repo/shared';
import { PaginatedUsers } from './repositories/users.repository';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UpdateUserPasswordRequestDto } from './dtos/update-user-password-request.dto';
import { UpdateUserStatusRequestDto } from './dtos/update-user-status-request.dto';

// UsersController — the account domain's HTTP surface (build-plan.md
// § 2.1). Protected automatically by the global JwtAuthGuard — no
// @Public() anywhere here (invariant #31: JwtAuthGuard alone is the only
// access check in the app). Controller stays thin per code-standards.md
// § 4: extract params/body → one service call → envelope, no branching.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Paginated account register for the 2.2 list screen: page/pageSize
  // window plus the single free-text search (username or linked person's
  // name/national number) — same envelope contract as GET /people
  // (PaginatedResultDto). Defaults: page 1, pageSize 10.
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ): Promise<{ success: true; data: UserDto[]; meta: PaginatedUsers['meta'] }> {
    // STEP 1: The service owns filtering + projection (data across the
    //         toDto gate); the controller only shapes the list envelope.
    const { data, meta } = await this.usersService.findAll({ page, pageSize, search });
    return { success: true, data, meta };
  }

  // Links an existing (unlinked) person to a new account — 404 when the
  // person doesn't exist, 409 when they already have one or the username
  // is taken, 400 on a malformed payload (global ValidationPipe).
  @Post()
  async create(
    @Body() dto: CreateUserRequestDto,
  ): Promise<{ success: true; data: UserDto }> {
    const data = await this.usersService.create(dto);
    return { success: true, data };
  }

  // Clerk-initiated password reset — re-hashes at cost 12; the response
  // carries the account (never the hash, invariant #15).
  @Patch(':id/password')
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserPasswordRequestDto,
  ): Promise<{ success: true; data: UserDto }> {
    const data = await this.usersService.updatePassword(id, dto);
    return { success: true, data };
  }

  // Active/inactive toggle; effective at the account's very next request
  // (JwtStrategy re-checks IsActive per request).
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusRequestDto,
  ): Promise<{ success: true; data: UserDto }> {
    const data = await this.usersService.updateStatus(id, dto);
    return { success: true, data };
  }

  // Hard delete of an account row — 409 when the account has linked
  // business records (Drivers/Applications); deactivation is the
  // everyday removal path (PATCH :id/status).
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: { id: number } }> {
    const data = await this.usersService.remove(id);
    return { success: true, data };
  }
}