import { Business } from '../entities/business.entity';

export interface IBusinessService {
  createBusiness(
    business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Business>;
  getAllBusinesses(): Promise<Business[]>;
  getBusinessById(id: string): Promise<Business | null>;
  updateBusiness(
    id: string,
    business: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Business>;
  deleteBusiness(id: string): Promise<void>;
}
