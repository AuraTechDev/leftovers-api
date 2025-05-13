import { Product } from '../../domain/entities/product.entity';
import { FoodType } from '../../domain/entities/food-type.entity';

export class ProductResponseDto {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  isFeatured: boolean;
  isDisabled: boolean;
  foodType?: FoodType | null;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    product: Product & { foodType?: FoodType | null },
  ): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.price = product.price;
    dto.quantity = product.quantity;
    dto.imageUrl = product.imageUrl;
    dto.isFeatured = product.isFeatured;
    dto.isDisabled = product.isDisabled;
    dto.foodType = product.foodType || null;
    dto.businessId = product.businessId;
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    return dto;
  }
}
