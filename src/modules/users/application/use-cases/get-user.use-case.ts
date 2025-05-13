import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromEntity(user);
  }
}
