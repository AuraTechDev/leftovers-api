import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class GetAllProductsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(businessId?: number): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.findAll(businessId);
    return products.map((product) => ProductResponseDto.fromEntity(product));
  }
}
