import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Product } from '../../domain/entities/product.entity';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    // Create new product entity
    const product = new Product();
    Object.assign(product, {
      ...createProductDto,
      isFeatured: createProductDto.isFeatured || false,
      isDisabled: createProductDto.isDisabled || false,
    });

    // Pass the entity to the repository
    const createdProduct = await this.productsRepository.create(product);
    return ProductResponseDto.fromEntity(createdProduct);
  }
}
