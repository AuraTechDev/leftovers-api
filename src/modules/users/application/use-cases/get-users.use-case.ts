import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}
