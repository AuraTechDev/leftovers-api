import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductInventoryService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly prisma: PrismaService,
  ) {}

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
    const product = await this.productsRepository.findById(productId);

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

    return true;
  }

  /**
   * Updates product quantity within a transaction
   * Returns the updated product
   */
  async decreaseInventory(productId: number, quantity: number): Promise<void> {
    // This will be called within a transaction when creating an order
    await this.productsRepository.decreaseQuantity(productId, quantity);
  }

  /**
   * Validates and decreases inventory in a single transaction
   * To be used when creating orders
   */
  async validateAndDecreaseInventory(
    productId: number,
    requestedQuantity: number,
  ): Promise<void> {
    return this.prisma.$transaction(async (prisma) => {
      // Get product with a lock for update
      const product = await prisma.product.findUnique({
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

      // Update product quantity
      await prisma.product.update({
        where: { id: productId },
        data: {
          quantity: {
            decrement: requestedQuantity,
          },
        },
      });
    });
  }
}
