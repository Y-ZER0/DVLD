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

// PeopleController — the citizen registry's HTTP surface (build-plan.md § 1.1).
// Protected automatically by the global JwtAuthGuard (auth.module.ts APP_GUARD)
// — no @Public() anywhere here. Controller stays thin per code-standards.md
// § 4: extract params/body → one service call → envelope, no branching.
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  // Paginated register feed for the 1.2 list screen: page/pageSize window
  // plus the single free-text search filter (matches name/national
  // number/email/phone). Defaults: page 1, pageSize 10.
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ): Promise<{ success: true; data: PersonDto[]; meta: PaginatedPeople['meta'] }> {
    // STEP 1: The service owns filtering + projection (data across the toDto
    //         gate); the controller only shapes the list envelope.
    const { data, meta } = await this.peopleService.findAll({ page, pageSize, search });
    return { success: true, data, meta };
  }

  // Every citizen with NO user account yet — the "Link to Person"
  // combobox feed for 2.2 (build-plan.md § 2.1). Plain array, no
  // pagination: the combobox filters client-side over the full set.
  // MUST stay declared BEFORE @Get(':id') — ParseIntPipe would otherwise
  // 400 the literal path "unlinked" (Session 6 gotcha).
  @Get('unlinked')
  async findUnlinked(): Promise<{ success: true; data: PersonDto[] }> {
    const data = await this.peopleService.findUnlinked();
    return { success: true, data };
  }

  // Single citizen record for the edit/detail view.
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: PersonDto }> {
    const data = await this.peopleService.findOne(id);
    return { success: true, data };
  }

  // Registers a new citizen — 409 on a duplicate National Number
  // (invariant #25), 400 on a malformed payload (global ValidationPipe).
  @Post()
  async create(
    @Body() dto: CreatePersonRequestDto,
  ): Promise<{ success: true; data: PersonDto }> {
    const data = await this.peopleService.create(dto);
    return { success: true, data };
  }

  // Partial update of a citizen record — true PATCH semantics: only the
  // fields present are validated/applied; National Number rules apply when
  // (and only when) the National Number itself is being changed.
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonRequestDto,
  ): Promise<{ success: true; data: PersonDto }> {
    const data = await this.peopleService.update(id, dto);
    return { success: true, data };
  }

  // Hard delete — 409 when the person is referenced by other records
  // (Users today, Drivers/Applications later), so a registry row with
  // history cannot silently disappear.
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: { id: number } }> {
    const data = await this.peopleService.remove(id);
    return { success: true, data };
  }
}