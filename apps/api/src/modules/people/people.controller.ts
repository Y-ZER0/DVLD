import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PersonDto } from '@repo/shared';
import { PaginatedPeople } from './repositories/people.repository';
import { PeopleService } from './people.service';
import { ImageKitService } from './imagekit.service';
import { CreatePersonRequestDto } from './dtos/create-person-request.dto';
import { UpdatePersonRequestDto } from './dtos/update-person-request.dto';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Controller('people')
export class PeopleController {
  constructor(
    private readonly peopleService: PeopleService,
    private readonly imageKitService: ImageKitService,
  ) {}

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

  @Post('photo-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
      },
    }),
  )
  async uploadTempPhoto(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: true; data: { url: string } }> {
    if (!file) throw new BadRequestException('Photo file is required');
    const url = await this.imageKitService.upload(file, file.originalname);
    return { success: true, data: { url } };
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
      },
    }),
  )
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: true; data: PersonDto }> {
    if (!file) throw new BadRequestException('Photo file is required');
    const url = await this.imageKitService.upload(file, file.originalname);
    const data = await this.peopleService.updatePhotoUrl(id, url);
    return { success: true, data };
  }

  @Delete(':id/photo')
  async removePhoto(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: PersonDto }> {
    const data = await this.peopleService.updatePhotoUrl(id, null);
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