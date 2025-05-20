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
  Query,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';
import { UsersRepository } from '../../../users/infrastructure/repositories/users.repository';
import { BusinessRepository } from '../../../business/infrastructure/repositories/business.repository';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../../../cloudinary/constants/upload-options';
import { UploadedFileType } from '../../../cloudinary/domain/interfaces/file-upload.interface';
import { GetUser } from '../../../auth/infrastructure/decorators/get-user.decorator';

// Products Use Cases
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetAllProductsUseCase } from '../../application/use-cases/get-all-products.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { UploadProductImageUseCase } from '../../application/use-cases/upload-product-image.use-case';
import { ToggleProductPropertyUseCase } from '../../application/use-cases/toggle-product-property.use-case';

// DTOs
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { ProductResponseDto } from '../../application/dtos/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(
    // Product use cases
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly uploadProductImageUseCase: UploadProductImageUseCase,
    private readonly toggleProductPropertyUseCase: ToggleProductPropertyUseCase,

    // Repositories for authorization
    private readonly usersRepository: UsersRepository,
    private readonly businessRepository: BusinessRepository,
  ) {}

  /**
   * Helper method to validate that a business user can only modify their own business's products
   * @throws ForbiddenException if user doesn't have access to the business
   * @throws NotFoundException if user is not found
   */
  private async validateBusinessOwnership(
    userId: number,
    businessId: number,
    operation: string,
  ): Promise<void> {
    const userWithRelations = await this.usersRepository.findById(userId);
    if (!userWithRelations) {
      throw new NotFoundException('User not found');
    }

    const userBusinessId = userWithRelations.businessId || 0;

    // Ensure the user belongs to the business that owns the product
    if (!userBusinessId || userBusinessId !== businessId) {
      throw new ForbiddenException(
        `You can only ${operation} products for your own business`,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @GetUser() currentUser: AuthUser,
  ): Promise<ProductResponseDto> {
    // If user is a BUSINESS role, ensure they're creating a product for their own business
    if (currentUser.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        currentUser.id,
        createProductDto.businessId,
        'create',
      );
    }

    return this.createProductUseCase.execute(createProductDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllProducts(
    @Query('businessId') businessId?: string,
  ): Promise<ProductResponseDto[]> {
    const parsedBusinessId = businessId ? parseInt(businessId, 10) : undefined;
    return this.getAllProductsUseCase.execute(parsedBusinessId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    return this.getProductUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() currentUser: AuthUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're updating a product from their own business
    if (currentUser.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        currentUser.id,
        product.businessId,
        'update',
      );
    }

    return this.updateProductUseCase.execute(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: AuthUser,
  ): Promise<void> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're deleting a product from their own business
    if (currentUser.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        currentUser.id,
        product.businessId,
        'delete',
      );
    }

    await this.deleteProductUseCase.execute(id);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadProductImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedFileType,
    @GetUser() currentUser: AuthUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're uploading an image for a product from their own business
    if (currentUser.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        currentUser.id,
        product.businessId,
        'upload images for',
      );
    }

    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    return this.uploadProductImageUseCase.execute(id, file.buffer);
  }

  @Patch(':id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async toggleProductFeature(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: AuthUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're toggling a product from their own business
    if (currentUser.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        currentUser.id,
        product.businessId,
        'update',
      );
    }

    return this.toggleProductPropertyUseCase.execute(id, 'isFeatured');
  }

  @Patch(':id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async toggleProductDisable(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: AuthUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're toggling a product from their own business
    if (currentUser.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        currentUser.id,
        product.businessId,
        'update',
      );
    }

    return this.toggleProductPropertyUseCase.execute(id, 'isDisabled');
  }
}
