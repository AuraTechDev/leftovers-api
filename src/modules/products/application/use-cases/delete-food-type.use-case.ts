import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FoodTypesRepository } from '../../infrastructure/repositories/food-types.repository';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class DeleteFoodTypeUseCase {
  constructor(
    private readonly foodTypesRepository: FoodTypesRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute(id: number): Promise<void> {
    // Check if food type exists
    const existingFoodType = await this.foodTypesRepository.findById(id);
    if (!existingFoodType) {
      throw new NotFoundException(`Food type with ID ${id} not found`);
    }

    try {
      // Delete the food type
      await this.foodTypesRepository.delete(id);
    } catch (error) {
      // Handle foreign key constraint violation
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          `Cannot delete food type with ID ${id} because it is being used by one or more products`,
        );
      }
      throw error;
    }
  }
}
