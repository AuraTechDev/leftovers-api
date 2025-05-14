import { Product } from '../entities/product.entity';

export interface IProductsRepository {
  create(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product>;
  findAll(businessId?: number): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  findByBusinessId(businessId: number): Promise<Product[]>;
  update(
    id: number,
    product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Product>;
  delete(id: number): Promise<void>;
  decreaseQuantity(id: number, quantity: number): Promise<Product>;
}
