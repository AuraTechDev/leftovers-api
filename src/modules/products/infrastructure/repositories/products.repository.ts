import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Product } from '../../domain/entities/product.entity';
import { IProductsRepository } from '../../domain/repositories/products.repository.interface';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    return await this.prisma.product.create({
      data: product,
      include: {
        foodType: true,
      },
    });
  }

  async findAll(businessId?: number): Promise<Product[]> {
    const where = businessId ? { businessId } : undefined;
    return await this.prisma.product.findMany({
      where,
      include: { foodType: true },
    });
  }

  async findById(id: number): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        foodType: true,
      },
    });
  }

  async findByBusinessId(businessId: number): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: { businessId },
      include: {
        foodType: true,
      },
    });
  }

  async update(
    id: number,
    product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Product> {
    return await this.prisma.product.update({
      where: { id },
      data: product,
      include: {
        foodType: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async decreaseQuantity(id: number, quantity: number): Promise<Product> {
    return await this.prisma.product.update({
      where: { id },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }
}
