import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: number): Promise<void> {
    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Delete the product
    await this.productsRepository.delete(id);
  }
}
