import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from '../../services/business.service';
import { CreateBusinessUseCase } from '../../../application/use-cases/create-business.use-case';
import { UpdateBusinessUseCase } from '../../../application/use-cases/update-business.use-case';
import { DeleteBusinessUseCase } from '../../../application/use-cases/delete-business.use-case';
import { GetBusinessUseCase } from '../../../application/use-cases/get-business.use-case';
import { GetAllBusinessesUseCase } from '../../../application/use-cases/get-all-businesses.use-case';
import { Business } from '../../../domain/entities/business.entity';
import { CreateBusinessDto } from '../../../application/dtos/create-business.dto';
import { UpdateBusinessDto } from '../../../application/dtos/update-business.dto';

describe('BusinessService', () => {
  let service: BusinessService;
  let createBusinessUseCase: CreateBusinessUseCase;
  let getAllBusinessesUseCase: GetAllBusinessesUseCase;
  let getBusinessUseCase: GetBusinessUseCase;
  let updateBusinessUseCase: UpdateBusinessUseCase;
  let deleteBusinessUseCase: DeleteBusinessUseCase;

  const mockBusiness: Business = {
    id: '1',
    name: 'Test Business',
    description: 'Test Description',
    address: '123 Test St',
    latitude: 40.7128,
    longitude: -74.006,
    contactEmail: 'business@example.com',
    phone: '555-1234',
    logoUrl: 'https://example.com/logo.png',
    openingHours: '9:00-17:00',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: CreateBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAllBusinessesUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    createBusinessUseCase = module.get<CreateBusinessUseCase>(
      CreateBusinessUseCase,
    );
    getAllBusinessesUseCase = module.get<GetAllBusinessesUseCase>(
      GetAllBusinessesUseCase,
    );
    getBusinessUseCase = module.get<GetBusinessUseCase>(GetBusinessUseCase);
    updateBusinessUseCase = module.get<UpdateBusinessUseCase>(
      UpdateBusinessUseCase,
    );
    deleteBusinessUseCase = module.get<DeleteBusinessUseCase>(
      DeleteBusinessUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBusiness', () => {
    it('should create a new business', async () => {
      const createBusinessDto: CreateBusinessDto = {
        name: 'New Business',
        address: '123 New St',
        latitude: 40.7128,
        longitude: -74.006,
        contactEmail: 'new@example.com',
      };

      const executeSpy = jest.spyOn(createBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusiness);

      const result = await service.createBusiness(createBusinessDto);

      expect(executeSpy).toHaveBeenCalledWith(createBusinessDto);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('getAllBusinesses', () => {
    it('should return all businesses', async () => {
      const executeSpy = jest.spyOn(getAllBusinessesUseCase, 'execute');
      executeSpy.mockResolvedValue([mockBusiness]);

      const result = await service.getAllBusinesses();

      expect(executeSpy).toHaveBeenCalled();
      expect(result).toEqual([mockBusiness]);
    });
  });

  describe('getBusinessById', () => {
    it('should return a business by id', async () => {
      const executeSpy = jest.spyOn(getBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusiness);

      const result = await service.getBusinessById('1');

      expect(executeSpy).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('updateBusiness', () => {
    it('should update a business', async () => {
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
        description: 'Updated Description',
      };

      const updatedBusiness = {
        ...mockBusiness,
        name: updateBusinessDto.name!,
        description: updateBusinessDto.description!,
      };

      const executeSpy = jest.spyOn(updateBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(updatedBusiness);

      const result = await service.updateBusiness('1', updateBusinessDto);

      expect(executeSpy).toHaveBeenCalledWith('1', updateBusinessDto);
      expect(result).toEqual(updatedBusiness);
    });
  });

  describe('deleteBusiness', () => {
    it('should delete a business', async () => {
      const executeSpy = jest.spyOn(deleteBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(undefined);

      await service.deleteBusiness('1');

      expect(executeSpy).toHaveBeenCalledWith('1');
    });
  });
});
