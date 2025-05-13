import { Injectable } from '@nestjs/common';
import { Business } from '../../domain/entities/business.entity';
import { IBusinessService } from '../../domain/services/business.service.interface';
import { CreateBusinessUseCase } from '../../application/use-cases/create-business.use-case';
import { GetAllBusinessesUseCase } from '../../application/use-cases/get-all-businesses.use-case';
import { GetBusinessUseCase } from '../../application/use-cases/get-business.use-case';
import { UpdateBusinessUseCase } from '../../application/use-cases/update-business.use-case';
import { DeleteBusinessUseCase } from '../../application/use-cases/delete-business.use-case';

@Injectable()
export class BusinessService implements IBusinessService {
  constructor(
    private readonly createBusinessUseCase: CreateBusinessUseCase,
    private readonly getAllBusinessesUseCase: GetAllBusinessesUseCase,
    private readonly getBusinessUseCase: GetBusinessUseCase,
    private readonly updateBusinessUseCase: UpdateBusinessUseCase,
    private readonly deleteBusinessUseCase: DeleteBusinessUseCase,
  ) {}

  async createBusiness(
    business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Business> {
    return await this.createBusinessUseCase.execute(business);
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await this.getAllBusinessesUseCase.execute();
  }

  async getBusinessById(id: number): Promise<Business | null> {
    return await this.getBusinessUseCase.execute(id);
  }

  async updateBusiness(
    id: number,
    business: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Business> {
    return await this.updateBusinessUseCase.execute(id, business);
  }

  async deleteBusiness(id: number): Promise<void> {
    await this.deleteBusinessUseCase.execute(id);
  }
}
