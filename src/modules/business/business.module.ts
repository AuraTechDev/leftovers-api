import { Module } from '@nestjs/common';
import { BusinessController } from './infrastructure/controllers/business.controller';
import { BusinessRepository } from './infrastructure/repositories/business.repository';
import { CreateBusinessUseCase } from './application/use-cases/create-business.use-case';
import { UpdateBusinessUseCase } from './application/use-cases/update-business.use-case';
import { DeleteBusinessUseCase } from './application/use-cases/delete-business.use-case';
import { GetBusinessUseCase } from './application/use-cases/get-business.use-case';
import { GetAllBusinessesUseCase } from './application/use-cases/get-all-businesses.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [BusinessController],
  providers: [
    BusinessRepository,
    CreateBusinessUseCase,
    UpdateBusinessUseCase,
    DeleteBusinessUseCase,
    GetBusinessUseCase,
    GetAllBusinessesUseCase,
  ],
  exports: [BusinessRepository],
})
export class BusinessModule {}
