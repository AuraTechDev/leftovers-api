import { Injectable } from '@nestjs/common';
import { FoodTypesRepository } from '../../infrastructure/repositories/food-types.repository';
import { FoodTypeResponseDto } from '../dtos/food-type-response.dto';

@Injectable()
export class GetAllFoodTypesUseCase {
  constructor(private readonly foodTypesRepository: FoodTypesRepository) {}

  async execute(): Promise<FoodTypeResponseDto[]> {
    const foodTypes = await this.foodTypesRepository.findAll();
    return foodTypes.map((foodType) =>
      FoodTypeResponseDto.fromEntity(foodType),
    );
  }
}
