import { Role, Provider } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  photoUrl?: string;
  role: Role;
  provider: Provider;
  businessId?: number | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const response = new UserResponseDto();
    response.id = user.id;
    response.email = user.email;
    response.name = user.name;
    response.photoUrl = user.photoUrl;
    response.role = user.role;
    response.provider = user.provider;
    response.businessId = user.businessId;
    response.createdAt = user.createdAt;
    response.updatedAt = user.updatedAt;
    return response;
  }
}
