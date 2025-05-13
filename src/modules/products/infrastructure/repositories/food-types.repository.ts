import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FoodType } from '../../domain/entities/food-type.entity';
import { IFoodTypesRepository } from '../../domain/repositories/food-types.repository.interface';

@Injectable()
export class FoodTypesRepository implements IFoodTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    foodType: Omit<FoodType, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FoodType> {
    return await this.prisma.foodType.create({
      data: foodType,
    });
  }

  async findAll(): Promise<FoodType[]> {
    return await this.prisma.foodType.findMany();
  }

  async findById(id: number): Promise<FoodType | null> {
    return await this.prisma.foodType.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    foodType: Partial<Omit<FoodType, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<FoodType> {
    return await this.prisma.foodType.update({
      where: { id },
      data: foodType,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.foodType.delete({
      where: { id },
    });
  }
}
