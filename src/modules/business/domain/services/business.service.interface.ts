import { Business } from '../entities/business.entity';

export interface IBusinessService {
  createBusiness(
    business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Business>;
  getAllBusinesses(): Promise<Business[]>;
  getBusinessById(id: number): Promise<Business | null>;
  updateBusiness(
    id: number,
    business: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Business>;
  deleteBusiness(id: number): Promise<void>;
}
