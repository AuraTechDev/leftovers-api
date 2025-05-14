import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return ProductResponseDto.fromEntity(product);
  }
}
