import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, BusinessModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
