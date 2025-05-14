import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Update the product
    const updatedProduct = await this.productsRepository.update(
      id,
      updateProductDto,
    );
    return ProductResponseDto.fromEntity(updatedProduct);
  }
}
