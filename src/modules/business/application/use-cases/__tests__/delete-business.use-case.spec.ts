import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteBusinessUseCase } from '../delete-business.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';

describe('DeleteBusinessUseCase', () => {
  let useCase: DeleteBusinessUseCase;
  let businessRepository: BusinessRepository;

  const mockBusiness = {
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
        DeleteBusinessUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteBusinessUseCase>(DeleteBusinessUseCase);
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a business', async () => {
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const deleteSpy = jest.spyOn(businessRepository, 'delete');

    findByIdSpy.mockResolvedValue(mockBusiness);
    deleteSpy.mockResolvedValue(undefined);

    await useCase.execute('1');

    expect(findByIdSpy).toHaveBeenCalledWith('1');
    expect(deleteSpy).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException when business not found', async () => {
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const deleteSpy = jest.spyOn(businessRepository, 'delete');

    findByIdSpy.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
    expect(findByIdSpy).toHaveBeenCalledWith('999');
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
