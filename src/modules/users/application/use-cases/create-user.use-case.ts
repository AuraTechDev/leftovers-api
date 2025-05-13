import {
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Role } from '@prisma/client';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    userData: CreateUserDto,
    currentUserRole?: Role,
  ): Promise<UserResponseDto> {
    // Only SUPER_ADMIN can create BUSINESS users
    if (
      userData.role === Role.BUSINESS &&
      currentUserRole !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can create BUSINESS users',
      );
    }

    // Validate businessId for BUSINESS role
    if (userData.role === Role.BUSINESS && !userData.businessId) {
      throw new ForbiddenException('Business ID is required for BUSINESS role');
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = new User({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdUser = await this.usersRepository.create(user);
    return UserResponseDto.fromEntity(createdUser);
  }
}
