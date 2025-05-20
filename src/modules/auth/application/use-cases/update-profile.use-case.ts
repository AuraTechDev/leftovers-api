import { Injectable, ConflictException } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UserDto } from '../dtos/auth-response.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDto> {
    if (updateProfileDto.email) {
      const existingUser = await this.authRepository.findUserByEmail(
        updateProfileDto.email,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use by another account');
      }
    }

    const updatedUser = await this.authRepository.updateUser(
      userId,
      updateProfileDto,
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      photoUrl: updatedUser.photoUrl || undefined,
      provider: updatedUser.provider,
      businessId: updatedUser.businessId || undefined,
    };
  }
}
