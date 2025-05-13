import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        provider: user.provider,
        providerId: user.providerId,
        photoUrl: user.photoUrl,
        businessId: user.businessId,
      },
    });

    return this.mapToEntity(createdUser);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.mapToEntity(user));
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
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

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private mapToEntity(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password || '',
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
