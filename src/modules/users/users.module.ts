import { Module } from '@nestjs/common';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { PrismaModule } from '../prisma/prisma.module';
import {
  CreateUserUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    CreateUserUseCase,
    GetUserUseCase,
    GetUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
