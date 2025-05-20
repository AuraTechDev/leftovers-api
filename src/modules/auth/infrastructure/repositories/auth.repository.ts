import { Injectable } from '@nestjs/common';
import {
  Provider,
  User as PrismaUser,
  RefreshToken as PrismaRefreshToken,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { User } from '../../../users/domain/entities/user.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

type RefreshTokenWithUser = PrismaRefreshToken & {
  user: PrismaUser;
};

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findUserByProviderAndProviderId(
    provider: Provider,
    providerId: string,
  ): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: userData.email!,
        name: userData.name!,
        password: userData.password,
        role: userData.role!,
        provider: userData.provider!,
        providerId: userData.providerId,
        photoUrl: userData.photoUrl,
        businessId: userData.businessId,
      },
    });

    return this.mapToEntity(createdUser);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        photoUrl: userData.photoUrl,
        role: userData.role,
        provider: userData.provider,
        providerId: userData.providerId,
        businessId: userData.businessId,
      },
    });

    return this.mapToEntity(updatedUser);
  }

  async createRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    const refreshTokenWithUser = refreshToken as RefreshTokenWithUser;

    return new RefreshToken({
      token: refreshTokenWithUser.token,
      userId: refreshTokenWithUser.userId,
      expiresAt: refreshTokenWithUser.expiresAt,
      user: this.mapToEntity(refreshTokenWithUser.user),
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  private mapToEntity(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password || undefined,
      photoUrl: prismaUser.photoUrl === null ? undefined : prismaUser.photoUrl,
      role: prismaUser.role,
      provider: prismaUser.provider,
      providerId:
        prismaUser.providerId === null ? undefined : prismaUser.providerId,
      businessId: prismaUser.businessId,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
