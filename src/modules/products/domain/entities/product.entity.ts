export class Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  isFeatured: boolean;
  isDisabled: boolean;
  foodTypeId?: number | null;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}
