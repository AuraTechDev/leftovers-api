import { Test, TestingModule } from '@nestjs/testing';
import { GetAllBusinessesUseCase } from '../get-all-businesses.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';

describe('GetAllBusinessesUseCase', () => {
  let useCase: GetAllBusinessesUseCase;
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
        GetAllBusinessesUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetAllBusinessesUseCase>(GetAllBusinessesUseCase);
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all businesses', async () => {
    const findAllSpy = jest.spyOn(businessRepository, 'findAll');
    findAllSpy.mockResolvedValue([mockBusiness]);

    const result = await useCase.execute();

    expect(findAllSpy).toHaveBeenCalled();
    expect(result).toEqual([mockBusiness]);
  });

  it('should return empty array when no businesses exist', async () => {
    const findAllSpy = jest.spyOn(businessRepository, 'findAll');
    findAllSpy.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(findAllSpy).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
