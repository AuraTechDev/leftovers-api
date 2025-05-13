import { FoodType } from '../entities/food-type.entity';

export interface IFoodTypesRepository {
  create(
    foodType: Omit<FoodType, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FoodType>;
  findAll(): Promise<FoodType[]>;
  findById(id: number): Promise<FoodType | null>;
  update(
    id: number,
    foodType: Partial<Omit<FoodType, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<FoodType>;
  delete(id: number): Promise<void>;
}
