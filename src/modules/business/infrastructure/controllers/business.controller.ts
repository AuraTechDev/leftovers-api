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
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
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
import { UploadBusinessLogoUseCase } from '../../application/use-cases/upload-business-logo.use-case';
import { UploadBusinessBannerUseCase } from '../../application/use-cases/upload-business-banner.use-case';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessResponseDto } from '../../application/dtos/business-response.dto';
import { imageUploadOptions } from '../../../cloudinary/constants/upload-options';
import { GetUser } from '../../../auth/infrastructure/decorators/get-user.decorator';
import { UploadedFileType } from '../../../cloudinary/interfaces/file-upload.interface';

@Controller('business')
export class BusinessController {
  constructor(
    private readonly createBusinessUseCase: CreateBusinessUseCase,
    private readonly getAllBusinessesUseCase: GetAllBusinessesUseCase,
    private readonly getBusinessUseCase: GetBusinessUseCase,
    private readonly updateBusinessUseCase: UpdateBusinessUseCase,
    private readonly deleteBusinessUseCase: DeleteBusinessUseCase,
    private readonly uploadBusinessLogoUseCase: UploadBusinessLogoUseCase,
    private readonly uploadBusinessBannerUseCase: UploadBusinessBannerUseCase,
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async getAllBusinesses(): Promise<Business[]> {
    return this.getAllBusinessesUseCase.execute();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
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
    @GetUser() currentUser: AuthUser,
  ): Promise<Business> {
    // If the user has the BUSINESS role, we verify that they are trying to update their own business
    if (currentUser.role === Role.BUSINESS) {
      // Retrieve the complete user with their relations from the database
      const userWithRelations = await this.usersRepository.findById(
        currentUser.id,
      );

      if (!userWithRelations) {
        throw new NotFoundException('User not found');
      }

      // If the user does not have an associated business or is trying to edit another business
      const userBusinessId = userWithRelations.businessId || 0;

      if (!userBusinessId || userBusinessId !== id) {
        throw new ForbiddenException('You can only update your own business');
      }
    }

    return this.updateBusinessUseCase.execute(id, updateBusinessDto);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedFileType,
    @GetUser() currentUser: AuthUser,
  ): Promise<BusinessResponseDto> {
    // Check if user is trying to update their own business logo (if BUSINESS role)
    if (currentUser.role === Role.BUSINESS) {
      const userWithRelations = await this.usersRepository.findById(
        currentUser.id,
      );

      if (!userWithRelations) {
        throw new NotFoundException('User not found');
      }

      // If the user does not have an associated business or is trying to edit another business
      const userBusinessId = userWithRelations.businessId || 0;

      if (!userBusinessId || userBusinessId !== id) {
        throw new ForbiddenException(
          'You can only update the logo of your own business',
        );
      }
    }

    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    return this.uploadBusinessLogoUseCase.execute(id, file.buffer);
  }

  @Post(':id/banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadBanner(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedFileType,
    @GetUser() currentUser: AuthUser,
  ): Promise<BusinessResponseDto> {
    // Check if user is trying to update their own business banner (if BUSINESS role)
    if (currentUser.role === Role.BUSINESS) {
      const userWithRelations = await this.usersRepository.findById(
        currentUser.id,
      );

      if (!userWithRelations) {
        throw new NotFoundException('User not found');
      }

      // If the user does not have an associated business or is trying to edit another business
      const userBusinessId = userWithRelations.businessId || 0;

      if (!userBusinessId || userBusinessId !== id) {
        throw new ForbiddenException(
          'You can only update the banner of your own business',
        );
      }
    }

    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    return this.uploadBusinessBannerUseCase.execute(id, file.buffer);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBusiness(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteBusinessUseCase.execute(id);
  }
}
