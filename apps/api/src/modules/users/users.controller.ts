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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ): Promise<{ success: true; data: UserDto[]; meta: PaginatedUsers['meta'] }> {
    const { data, meta } = await this.usersService.findAll({ page, pageSize, search });
    return { success: true, data, meta };
  }

  @Post()
  async create(
    @Body() dto: CreateUserRequestDto,
  ): Promise<{ success: true; data: UserDto }> {
    const data = await this.usersService.create(dto);
    return { success: true, data };
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserPasswordRequestDto,
  ): Promise<{ success: true; data: UserDto }> {
    const data = await this.usersService.updatePassword(id, dto);
    return { success: true, data };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusRequestDto,
  ): Promise<{ success: true; data: UserDto }> {
    const data = await this.usersService.updateStatus(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: { id: number } }> {
    const data = await this.usersService.remove(id);
    return { success: true, data };
  }
}