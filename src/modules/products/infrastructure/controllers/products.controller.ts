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
import { imageUploadOptions } from '../config/file-upload.config';

// Products Use Cases
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetAllProductsUseCase } from '../../application/use-cases/get-all-products.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { UploadProductImageUseCase } from '../../application/use-cases/upload-product-image.use-case';
import { ToggleProductPropertyUseCase } from '../../application/use-cases/toggle-product-property.use-case';

// Food Types Use Cases
import { CreateFoodTypeUseCase } from '../../application/use-cases/create-food-type.use-case';
import { GetAllFoodTypesUseCase } from '../../application/use-cases/get-all-food-types.use-case';
import { UpdateFoodTypeUseCase } from '../../application/use-cases/update-food-type.use-case';
import { DeleteFoodTypeUseCase } from '../../application/use-cases/delete-food-type.use-case';

// DTOs
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { ProductResponseDto } from '../../application/dtos/product-response.dto';
import { CreateFoodTypeDto } from '../../application/dtos/create-food-type.dto';
import { UpdateFoodTypeDto } from '../../application/dtos/update-food-type.dto';

interface RequestWithUser extends Request {
  user: AuthUser;
}

// Define file upload interface
interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller()
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

    // Food type use cases
    private readonly createFoodTypeUseCase: CreateFoodTypeUseCase,
    private readonly getAllFoodTypesUseCase: GetAllFoodTypesUseCase,
    private readonly updateFoodTypeUseCase: UpdateFoodTypeUseCase,
    private readonly deleteFoodTypeUseCase: DeleteFoodTypeUseCase,

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

  /* ========= PRODUCT ENDPOINTS ========= */

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto> {
    // If user is a BUSINESS role, ensure they're creating a product for their own business
    if (req.user.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        req.user.id,
        createProductDto.businessId,
        'create',
      );
    }

    return this.createProductUseCase.execute(createProductDto);
  }

  @Get('products')
  @UseGuards(JwtAuthGuard)
  async getAllProducts(
    @Query('businessId', ParseIntPipe) businessId?: number,
  ): Promise<ProductResponseDto[]> {
    return this.getAllProductsUseCase.execute(businessId);
  }

  @Get('products/:id')
  @UseGuards(JwtAuthGuard)
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    return this.getProductUseCase.execute(id);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're updating a product from their own business
    if (req.user.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        req.user.id,
        product.businessId,
        'update',
      );
    }

    return this.updateProductUseCase.execute(id, updateProductDto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're deleting a product from their own business
    if (req.user.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        req.user.id,
        product.businessId,
        'delete',
      );
    }

    await this.deleteProductUseCase.execute(id);
  }

  @Post('products/:id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadProductImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedFileType,
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're uploading an image for a product from their own business
    if (req.user.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        req.user.id,
        product.businessId,
        'upload images for',
      );
    }

    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    return this.uploadProductImageUseCase.execute(id, file.buffer);
  }

  @Patch('products/:id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async toggleProductFeature(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're toggling a product from their own business
    if (req.user.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        req.user.id,
        product.businessId,
        'update',
      );
    }

    return this.toggleProductPropertyUseCase.execute(id, 'isFeatured');
  }

  @Patch('products/:id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BUSINESS)
  async toggleProductDisable(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto> {
    // First get the product to check authorization
    const product = await this.getProductUseCase.execute(id);

    // If user has BUSINESS role, ensure they're toggling a product from their own business
    if (req.user.role === Role.BUSINESS) {
      await this.validateBusinessOwnership(
        req.user.id,
        product.businessId,
        'update',
      );
    }

    return this.toggleProductPropertyUseCase.execute(id, 'isDisabled');
  }

  /* ========= FOOD TYPE ENDPOINTS ========= */

  @Post('food-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createFoodType(@Body() createFoodTypeDto: CreateFoodTypeDto) {
    return this.createFoodTypeUseCase.execute(createFoodTypeDto);
  }

  @Get('food-types')
  @UseGuards(JwtAuthGuard)
  async getAllFoodTypes() {
    return this.getAllFoodTypesUseCase.execute();
  }

  @Put('food-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateFoodType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFoodTypeDto: UpdateFoodTypeDto,
  ) {
    return this.updateFoodTypeUseCase.execute(id, updateFoodTypeDto);
  }

  @Delete('food-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFoodType(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteFoodTypeUseCase.execute(id);
  }
}
