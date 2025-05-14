import { Injectable, ConflictException } from '@nestjs/common';
import { FoodTypesRepository } from '../../infrastructure/repositories/food-types.repository';
import { CreateFoodTypeDto } from '../dtos/create-food-type.dto';
import { FoodType } from '../../domain/entities/food-type.entity';
import { FoodTypeResponseDto } from '../dtos/food-type-response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CreateFoodTypeUseCase {
  constructor(private readonly foodTypesRepository: FoodTypesRepository) {}

  async execute(
    createFoodTypeDto: CreateFoodTypeDto,
  ): Promise<FoodTypeResponseDto> {
    // Create new food type entity
    const foodType = new FoodType();
    Object.assign(foodType, createFoodTypeDto);

    try {
      // Pass the entity to the repository
      const createdFoodType = await this.foodTypesRepository.create(foodType);
      return FoodTypeResponseDto.fromEntity(createdFoodType);
    } catch (error) {
      // Handle unique constraint violation
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Food type with name '${createFoodTypeDto.name}' already exists`,
        );
      }
      throw error;
    }
  }
}
