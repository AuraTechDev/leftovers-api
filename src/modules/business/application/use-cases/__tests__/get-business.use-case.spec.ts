import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetBusinessUseCase } from '../get-business.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';

describe('GetBusinessUseCase', () => {
  let useCase: GetBusinessUseCase;
  let businessRepository: BusinessRepository;

  const mockBusiness = {
    id: 1,
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
        GetBusinessUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetBusinessUseCase>(GetBusinessUseCase);
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should get a business by id', async () => {
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    findByIdSpy.mockResolvedValue(mockBusiness);

    const result = await useCase.execute(1);

    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockBusiness);
  });

  it('should throw NotFoundException when business not found', async () => {
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    findByIdSpy.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    expect(findByIdSpy).toHaveBeenCalledWith(999);
  });
});
