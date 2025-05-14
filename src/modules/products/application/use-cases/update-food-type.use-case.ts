import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FoodTypesRepository } from '../../infrastructure/repositories/food-types.repository';
import { UpdateFoodTypeDto } from '../dtos/update-food-type.dto';
import { FoodTypeResponseDto } from '../dtos/food-type-response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UpdateFoodTypeUseCase {
  constructor(private readonly foodTypesRepository: FoodTypesRepository) {}

  async execute(
    id: number,
    updateFoodTypeDto: UpdateFoodTypeDto,
  ): Promise<FoodTypeResponseDto> {
    // Check if food type exists
    const existingFoodType = await this.foodTypesRepository.findById(id);
    if (!existingFoodType) {
      throw new NotFoundException(`Food type with ID ${id} not found`);
    }

    try {
      // Update the food type
      const updatedFoodType = await this.foodTypesRepository.update(
        id,
        updateFoodTypeDto,
      );
      return FoodTypeResponseDto.fromEntity(updatedFoodType);
    } catch (error) {
      // Handle unique constraint violation
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Food type with name '${updateFoodTypeDto.name}' already exists`,
        );
      }
      throw error;
    }
  }
}
