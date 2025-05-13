import { Module } from '@nestjs/common';
import { ProductsController } from './infrastructure/controllers/products.controller';
import { ProductsRepository } from './infrastructure/repositories/products.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { BusinessModule } from '../business/business.module';
import { FoodTypesRepository } from './infrastructure/repositories/food-types.repository';
import { GetAllFoodTypesUseCase } from './application/use-cases/get-all-food-types.use-case';
import { CreateFoodTypeUseCase } from './application/use-cases/create-food-type.use-case';
import { UpdateFoodTypeUseCase } from './application/use-cases/update-food-type.use-case';
import { DeleteFoodTypeUseCase } from './application/use-cases/delete-food-type.use-case';
import { UploadProductImageUseCase } from './application/use-cases/upload-product-image.use-case';

@Module({
  imports: [PrismaModule, UsersModule, CloudinaryModule, BusinessModule],
  controllers: [ProductsController],
  providers: [
    // Product repositories
    ProductsRepository,
    FoodTypesRepository,

    // Product use cases
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetAllProductsUseCase,
    UploadProductImageUseCase,

    // Food type use cases
    GetAllFoodTypesUseCase,
    CreateFoodTypeUseCase,
    UpdateFoodTypeUseCase,
    DeleteFoodTypeUseCase,
  ],
  exports: [ProductsRepository],
})
export class ProductsModule {}
