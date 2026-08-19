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
import { PersonDto } from '@repo/shared';
import { PaginatedPeople } from './repositories/people.repository';
import { PeopleService } from './people.service';
import { CreatePersonRequestDto } from './dtos/create-person-request.dto';
import { UpdatePersonRequestDto } from './dtos/update-person-request.dto';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ): Promise<{ success: true; data: PersonDto[]; meta: PaginatedPeople['meta'] }> {
    const { data, meta } = await this.peopleService.findAll({ page, pageSize, search });
    return { success: true, data, meta };
  }

  @Get('unlinked')
  async findUnlinked(): Promise<{ success: true; data: PersonDto[] }> {
    const data = await this.peopleService.findUnlinked();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: PersonDto }> {
    const data = await this.peopleService.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(
    @Body() dto: CreatePersonRequestDto,
  ): Promise<{ success: true; data: PersonDto }> {
    const data = await this.peopleService.create(dto);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonRequestDto,
  ): Promise<{ success: true; data: PersonDto }> {
    const data = await this.peopleService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: { id: number } }> {
    const data = await this.peopleService.remove(id);
    return { success: true, data };
  }
}