import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Business } from '../../domain/entities/business.entity';
import { IBusinessRepository } from '../../domain/repositories/business.repository.interface';

@Injectable()
export class BusinessRepository implements IBusinessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Business> {
    return await this.prisma.business.create({
      data: business,
    });
  }

  async findAll(): Promise<Business[]> {
    return await this.prisma.business.findMany();
  }

  async findById(id: string): Promise<Business | null> {
    return await this.prisma.business.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    business: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Business> {
    return await this.prisma.business.update({
      where: { id },
      data: business,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.business.delete({
      where: { id },
    });
  }
}
