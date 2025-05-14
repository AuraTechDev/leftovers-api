import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateDiscoverSectionDto } from '../../application/dtos/create-discover-section.dto';
import { UpdateDiscoverSectionDto } from '../../application/dtos/update-discover-section.dto';
import { CreateDiscoverSectionUseCase } from '../../application/use-cases/create-discover-section.use-case';
import { GetAllDiscoverSectionsUseCase } from '../../application/use-cases/get-all-discover-sections.use-case';
import { GetDiscoverSectionUseCase } from '../../application/use-cases/get-discover-section.use-case';
import { UpdateDiscoverSectionUseCase } from '../../application/use-cases/update-discover-section.use-case';
import { DeleteDiscoverSectionUseCase } from '../../application/use-cases/delete-discover-section.use-case';
import { DiscoverSectionResponseDto } from '../../application/dtos/discover-section-response.dto';

/**
 * Controller for managing discover sections
 * IMPORTANT: All endpoints in this controller are restricted to SUPER_ADMIN role only
 */
@Controller('discover-sections')
export class DiscoverSectionController {
  constructor(
    private readonly createDiscoverSectionUseCase: CreateDiscoverSectionUseCase,
    private readonly getAllDiscoverSectionsUseCase: GetAllDiscoverSectionsUseCase,
    private readonly getDiscoverSectionUseCase: GetDiscoverSectionUseCase,
    private readonly updateDiscoverSectionUseCase: UpdateDiscoverSectionUseCase,
    private readonly deleteDiscoverSectionUseCase: DeleteDiscoverSectionUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createDiscoverSection(
    @Body() createDiscoverSectionDto: CreateDiscoverSectionDto,
  ): Promise<DiscoverSectionResponseDto> {
    return this.createDiscoverSectionUseCase.execute(createDiscoverSectionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async getAllDiscoverSections(): Promise<DiscoverSectionResponseDto[]> {
    return this.getAllDiscoverSectionsUseCase.execute();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async getDiscoverSectionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DiscoverSectionResponseDto> {
    return this.getDiscoverSectionUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateDiscoverSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiscoverSectionDto: UpdateDiscoverSectionDto,
  ): Promise<DiscoverSectionResponseDto> {
    return this.updateDiscoverSectionUseCase.execute(
      id,
      updateDiscoverSectionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDiscoverSection(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.deleteDiscoverSectionUseCase.execute(id);
  }
}
