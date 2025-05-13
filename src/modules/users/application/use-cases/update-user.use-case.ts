import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    id: string,
    userData: UpdateUserDto,
    currentUserRole?: Role,
  ): Promise<UserResponseDto> {
    // Validate businessId for BUSINESS role
    if (userData.role === Role.BUSINESS && !userData.businessId) {
      throw new ForbiddenException('Business ID is required for BUSINESS role');
    }

    // Only SUPER_ADMIN can change a user's role
    if (userData.role && currentUserRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException("Only SUPER_ADMIN can change a user's role");
    }

    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersRepository.update(id, {
      ...userData,
      updatedAt: new Date(),
    });

    return UserResponseDto.fromEntity(updatedUser);
  }
}
