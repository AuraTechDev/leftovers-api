import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetProductRatingsUseCase } from '../../application/use-cases/get-product-ratings.use-case';

@Controller('products')
export class ProductRatingsController {
  constructor(
    private readonly getProductRatingsUseCase: GetProductRatingsUseCase,
  ) {}

  @Get(':id/ratings')
  async getProductRatings(@Param('id', ParseIntPipe) productId: number) {
    return this.getProductRatingsUseCase.execute(productId);
  }
}
