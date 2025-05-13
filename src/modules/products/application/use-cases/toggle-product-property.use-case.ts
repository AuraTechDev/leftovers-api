import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class ToggleProductPropertyUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  /**
   * Generic method to toggle boolean properties on product
   * @param id Product ID
   * @param property The property name to toggle (must be boolean)
   */
  async execute(
    id: number,
    property: 'isFeatured' | 'isDisabled',
  ): Promise<ProductResponseDto> {
    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Toggle specified property
    const updatedProduct = await this.productsRepository.update(id, {
      [property]: !existingProduct[property],
    });

    return ProductResponseDto.fromEntity(updatedProduct);
  }
}
