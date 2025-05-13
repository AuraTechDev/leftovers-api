import { Business } from '../entities/business.entity';

export interface IBusinessRepository {
  create(
    business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Business>;
  findAll(): Promise<Business[]>;
  findById(id: number): Promise<Business | null>;
  update(
    id: number,
    business: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Business>;
  delete(id: number): Promise<void>;
}
