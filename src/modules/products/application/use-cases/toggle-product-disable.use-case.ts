import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class ToggleProductDisableUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: number): Promise<ProductResponseDto> {
    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Toggle isDisabled flag
    const updatedProduct = await this.productsRepository.update(id, {
      isDisabled: !existingProduct.isDisabled,
    });

    return ProductResponseDto.fromEntity(updatedProduct);
  }
}
