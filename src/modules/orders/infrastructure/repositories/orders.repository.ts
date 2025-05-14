import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Order } from '../../domain/entities/order.entity';
import { IOrdersRepository } from '../../domain/repositories/orders.repository.interface';
import { Prisma, OrderStatus } from '@prisma/client';

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

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    return await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        product: true,
        user: true,
        business: true,
      },
    });
  }

  async findPaginatedByUser(
    userId: number,
    page: number,
    pageSize: number,
    status?: OrderStatus,
  ): Promise<{ orders: Order[]; total: number }> {
    const where: Prisma.OrderWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    // Ensure page and pageSize are numbers
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 10;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        include: {
          product: true,
          business: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findPaginatedByBusiness(
    businessId: number,
    page: number,
    pageSize: number,
    status?: OrderStatus,
  ): Promise<{ orders: Order[]; total: number }> {
    const where: Prisma.OrderWhereInput = { businessId };

    if (status) {
      where.status = status;
    }

    // Ensure page and pageSize are numbers
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 10;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        include: {
          product: true,
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total };
  }
}
