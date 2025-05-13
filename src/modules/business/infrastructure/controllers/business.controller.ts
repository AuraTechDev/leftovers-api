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
import { CreateBusinessDto } from '../../application/dtos/create-business.dto';
import { UpdateBusinessDto } from '../../application/dtos/update-business.dto';
import { Business } from '../../domain/entities/business.entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';
import { UsersRepository } from '../../../users/infrastructure/repositories/users.repository';
import { CreateBusinessUseCase } from '../../application/use-cases/create-business.use-case';
import { GetAllBusinessesUseCase } from '../../application/use-cases/get-all-businesses.use-case';
import { GetBusinessUseCase } from '../../application/use-cases/get-business.use-case';
import { UpdateBusinessUseCase } from '../../application/use-cases/update-business.use-case';
import { DeleteBusinessUseCase } from '../../application/use-cases/delete-business.use-case';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@Controller('business')
export class BusinessController {
  constructor(
    private readonly createBusinessUseCase: CreateBusinessUseCase,
    private readonly getAllBusinessesUseCase: GetAllBusinessesUseCase,
    private readonly getBusinessUseCase: GetBusinessUseCase,
    private readonly updateBusinessUseCase: UpdateBusinessUseCase,
    private readonly deleteBusinessUseCase: DeleteBusinessUseCase,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    return this.createBusinessUseCase.execute(createBusinessDto);
  }

  @Get()
  async getAllBusinesses(): Promise<Business[]> {
    return this.getAllBusinessesUseCase.execute();
  }

  @Get(':id')
  async getBusinessById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Business> {
    const business = await this.getBusinessUseCase.execute(id);
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
      const userWithRelations = await this.usersRepository.findById(
        req.user.id.toString(),
      );

      if (!userWithRelations) {
        throw new NotFoundException('User not found');
      }

      // If the user does not have an associated business or is trying to edit another business
      const userBusinessId = userWithRelations.businessId || 0;
      if (!userBusinessId || userBusinessId !== id) {
        throw new ForbiddenException(
          'Solo puedes actualizar tu propio negocio',
        );
      }
    }

    return this.updateBusinessUseCase.execute(id, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBusiness(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteBusinessUseCase.execute(id);
  }
}
