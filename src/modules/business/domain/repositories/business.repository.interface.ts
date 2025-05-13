import { Business } from '../entities/business.entity';

export interface IBusinessRepository {
  create(
    business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Business>;
  findAll(): Promise<Business[]>;
  findById(id: string): Promise<Business | null>;
  update(
    id: string,
    business: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Business>;
  delete(id: string): Promise<void>;
}
