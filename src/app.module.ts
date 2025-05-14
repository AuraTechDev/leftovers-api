import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { DiscoverModule } from './modules/discover/discover.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    BusinessModule,
    CloudinaryModule,
    ProductsModule,
    OrdersModule,
    RatingsModule,
    DiscoverModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
