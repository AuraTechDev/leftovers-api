import { Module } from '@nestjs/common';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UsersService } from './infrastructure/services/users.service';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, CreateUserUseCase],
  exports: [UsersService],
})
export class UsersModule {}
