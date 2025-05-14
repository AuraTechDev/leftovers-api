import { FoodType } from '../../domain/entities/food-type.entity';

export class FoodTypeResponseDto {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(foodType: FoodType): FoodTypeResponseDto {
    const dto = new FoodTypeResponseDto();
    dto.id = foodType.id;
    dto.name = foodType.name;
    dto.createdAt = foodType.createdAt;
    dto.updatedAt = foodType.updatedAt;
    return dto;
  }
}
