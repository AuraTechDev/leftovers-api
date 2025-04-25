import { Injectable } from '@nestjs/common';
import { UsersService } from '../../infrastructure/services/users.service';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(name: string, email: string, password: string): Promise<User> {
    const userData = { name, email, password };
    return await this.usersService.createUser(userData);
  }
}
