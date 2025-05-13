import { Test, TestingModule } from '@nestjs/testing';
import { CreateBusinessUseCase } from '../create-business.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';
import { CreateBusinessDto } from '../../dtos/create-business.dto';

describe('CreateBusinessUseCase', () => {
  let useCase: CreateBusinessUseCase;
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
        CreateBusinessUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateBusinessUseCase>(CreateBusinessUseCase);
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a business', async () => {
    const createBusinessDto: CreateBusinessDto = {
      name: 'New Business',
      address: '456 New St',
      latitude: 41.8781,
      longitude: -87.6298,
      contactEmail: 'new@example.com',
    };

    const createSpy = jest.spyOn(businessRepository, 'create');
    createSpy.mockResolvedValue(mockBusiness);

    const result = await useCase.execute(createBusinessDto);

    expect(createSpy).toHaveBeenCalledWith(createBusinessDto);
    expect(result).toEqual(mockBusiness);
  });
});
