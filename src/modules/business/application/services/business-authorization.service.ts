import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/repositories/users.repository';
import { Role } from '@prisma/client';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';

@Injectable()
export class BusinessAuthorizationService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async verifyBusinessAccess(
    currentUser: AuthUser,
    businessId: number,
    action: string,
  ): Promise<void> {
    if (currentUser.role === Role.SUPER_ADMIN) {
      return;
    }

    if (currentUser.role !== Role.BUSINESS) {
      throw new ForbiddenException(`You don't have permission to ${action}`);
    }

    const userWithRelations = await this.usersRepository.findById(
      currentUser.id,
    );

    if (!userWithRelations) {
      throw new NotFoundException('User not found');
    }

    const userBusinessId = userWithRelations.businessId || 0;

    if (!userBusinessId || userBusinessId !== businessId) {
      throw new ForbiddenException(`You can only ${action} your own business`);
    }
  }
}
