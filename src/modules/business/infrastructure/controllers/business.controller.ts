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
  ForbiddenException,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BusinessService } from '../services/business.service';
import { CreateBusinessDto } from '../../application/dtos/create-business.dto';
import { UpdateBusinessDto } from '../../application/dtos/update-business.dto';
import { Business } from '../../domain/entities/business.entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';
import { UsersService } from '../../../users/infrastructure/services/users.service';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@Controller('business')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly usersService: UsersService,
  ) {}

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
  async getBusinessById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Business> {
    const business = await this.businessService.getBusinessById(id);
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return business;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async updateBusiness(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req: RequestWithUser,
  ): Promise<Business> {
    // If the user has the BUSINESS role, we verify that they are trying to update their own business
    if (req.user.role === Role.BUSINESS) {
      // Retrieve the complete user with their relations from the database
      const userWithRelations = await this.usersService.getUserById(
        req.user.id.toString(),
      );

      // If the user does not have an associated business or is trying to edit another business
      const userBusinessId = userWithRelations.businessId || 0;
      if (!userBusinessId || userBusinessId !== id) {
        throw new ForbiddenException(
          'Solo puedes actualizar tu propio negocio',
        );
      }
    }

    return await this.businessService.updateBusiness(id, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBusiness(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.businessService.deleteBusiness(id);
  }
}
