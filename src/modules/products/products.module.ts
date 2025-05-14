import { Module } from '@nestjs/common';
import { ProductsController } from './infrastructure/controllers/products.controller';
import { ProductRatingsController } from './infrastructure/controllers/product-ratings.controller';
import { ProductsRepository } from './infrastructure/repositories/products.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { GetProductRatingsUseCase } from './application/use-cases/get-product-ratings.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { BusinessModule } from '../business/business.module';
import { RatingsModule } from '../ratings/ratings.module';
import { FoodTypesRepository } from './infrastructure/repositories/food-types.repository';
import { GetAllFoodTypesUseCase } from './application/use-cases/get-all-food-types.use-case';
import { CreateFoodTypeUseCase } from './application/use-cases/create-food-type.use-case';
import { UpdateFoodTypeUseCase } from './application/use-cases/update-food-type.use-case';
import { DeleteFoodTypeUseCase } from './application/use-cases/delete-food-type.use-case';
import { UploadProductImageUseCase } from './application/use-cases/upload-product-image.use-case';
import { ToggleProductPropertyUseCase } from './application/use-cases/toggle-product-property.use-case';
import { ProductInventoryService } from './application/services/product-inventory.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    CloudinaryModule,
    BusinessModule,
    RatingsModule,
  ],
  controllers: [ProductsController, ProductRatingsController],
  providers: [
    // Product repositories
    ProductsRepository,
    FoodTypesRepository,

    // Product services
    ProductInventoryService,

    // Product use cases
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetAllProductsUseCase,
    GetProductRatingsUseCase,
    UploadProductImageUseCase,
    ToggleProductPropertyUseCase,

    // Food type use cases
    GetAllFoodTypesUseCase,
    CreateFoodTypeUseCase,
    UpdateFoodTypeUseCase,
    DeleteFoodTypeUseCase,
  ],
  exports: [ProductsRepository, ProductInventoryService],
})
export class ProductsModule {}
