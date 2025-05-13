import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { BusinessService } from '../services/business.service';
import { CreateBusinessDto } from '../../application/dtos/create-business.dto';
import { UpdateBusinessDto } from '../../application/dtos/update-business.dto';
import { Business } from '../../domain/entities/business.entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    return await this.businessService.createBusiness(createBusinessDto);
  }

  @Get()
  async getAllBusinesses(): Promise<Business[]> {
    return await this.businessService.getAllBusinesses();
  }

  @Get(':id')
  async getBusinessById(@Param('id') id: string): Promise<Business> {
    const business = await this.businessService.getBusinessById(id);
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return business;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN) // Por ahora solo SUPER_ADMIN puede editar negocios
  async updateBusiness(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    return await this.businessService.updateBusiness(id, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBusiness(@Param('id') id: string): Promise<void> {
    await this.businessService.deleteBusiness(id);
  }
}
