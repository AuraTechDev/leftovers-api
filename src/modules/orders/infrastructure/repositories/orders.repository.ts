import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Order } from '../../domain/entities/order.entity';
import { IOrdersRepository } from '../../domain/repositories/orders.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order> {
    return await this.prisma.order.create({
      data: order,
      include: {
        product: true,
        user: true,
        business: true,
      },
    });
  }

  async findAll(userId?: number, businessId?: number): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (businessId) {
      where.businessId = businessId;
    }

    return await this.prisma.order.findMany({
      where,
      include: {
        product: true,
        user: true,
        business: true,
      },
    });
  }

  async findById(id: number): Promise<Order | null> {
    return await this.prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        user: true,
        business: true,
      },
    });
  }

  async update(
    id: number,
    order: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Order> {
    return await this.prisma.order.update({
      where: { id },
      data: order,
      include: {
        product: true,
        user: true,
        business: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }
}
