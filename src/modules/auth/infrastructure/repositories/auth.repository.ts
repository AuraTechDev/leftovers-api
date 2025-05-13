import { Injectable } from '@nestjs/common';
import { User, Provider } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByProviderAndProviderId(
    provider: Provider,
    providerId: string,
  ): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return await this.prisma.user.create({
      data: userData as any,
    });
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: userData,
    });
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

  async findRefreshToken(token: string): Promise<{
    token: string;
    userId: number;
    expiresAt: Date;
    user: User;
  } | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    return {
      token: refreshToken.token,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      user: refreshToken.user,
    };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }
}
