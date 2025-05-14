import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductInventoryService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Validates product can be ordered (exists, not disabled, has stock)
   */
  private async validateProduct(
    productId: number,
    requestedQuantity: number,
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const product = await prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException(`Product with ID ${productId} not found`);
    }

    if (product.isDisabled) {
      throw new BadRequestException(
        `Product with ID ${productId} is currently unavailable`,
      );
    }

    if (product.quantity <= 0) {
      throw new BadRequestException(
        `Product with ID ${productId} is out of stock`,
      );
    }

    if (requestedQuantity > product.quantity) {
      throw new BadRequestException(
        `Requested quantity (${requestedQuantity}) exceeds available stock (${product.quantity}) for product with ID ${productId}`,
      );
    }

    return product;
  }

  /**
   * Validates if a product can be ordered based on:
   * 1. Product exists
   * 2. Product is not disabled
   * 3. Requested quantity is available
   */
  async validateProductForOrder(
    productId: number,
    requestedQuantity: number,
  ): Promise<boolean> {
    await this.validateProduct(productId, requestedQuantity);
    return true;
  }

  /**
   * Updates product quantity
   */
  async decreaseInventory(productId: number, quantity: number): Promise<void> {
    await this.productsRepository.decreaseQuantity(productId, quantity);
  }

  /**
   * Validates and decreases inventory in a single transaction
   * To be used when creating orders
   */
  async validateAndDecreaseInventory(
    productId: number,
    requestedQuantity: number,
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    if (prismaClient === this.prisma) {
      // If not called with a transaction, create one
      return this.prisma.$transaction(async (tx) => {
        await this.validateAndDecreaseInventory(
          productId,
          requestedQuantity,
          tx,
        );
      });
    }

    // Called with transaction client
    await this.validateProduct(productId, requestedQuantity, prismaClient);

    // Update product quantity
    await prismaClient.product.update({
      where: { id: productId },
      data: {
        quantity: {
          decrement: requestedQuantity,
        },
      },
    });
  }
}
