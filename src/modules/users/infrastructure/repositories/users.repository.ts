import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
      },
    });

    return new User({
      id: createdUser.id.toString(),
      email: createdUser.email,
      name: createdUser.name,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) return null;

    return new User({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      businessId: user.businessId,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      businessId: user.businessId,
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email: userData.email,
        name: userData.name,
        businessId: userData.businessId,
      },
    });

    return new User({
      id: updatedUser.id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      businessId: updatedUser.businessId,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: parseInt(id) },
    });
  }
}
