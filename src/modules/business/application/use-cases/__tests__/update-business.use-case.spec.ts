import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateBusinessUseCase } from '../update-business.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';
import { UpdateBusinessDto } from '../../dtos/update-business.dto';

describe('UpdateBusinessUseCase', () => {
  let useCase: UpdateBusinessUseCase;
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
        UpdateBusinessUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateBusinessUseCase>(UpdateBusinessUseCase);
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

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

    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const updateSpy = jest.spyOn(businessRepository, 'update');

    findByIdSpy.mockResolvedValue(mockBusiness);
    updateSpy.mockResolvedValue(updatedBusiness);

    const result = await useCase.execute('1', updateBusinessDto);

    expect(findByIdSpy).toHaveBeenCalledWith('1');
    expect(updateSpy).toHaveBeenCalledWith('1', updateBusinessDto);
    expect(result).toEqual(updatedBusiness);
  });

  it('should throw NotFoundException when business not found', async () => {
    const updateBusinessDto: UpdateBusinessDto = {
      name: 'Updated Business',
    };

    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const updateSpy = jest.spyOn(businessRepository, 'update');

    findByIdSpy.mockResolvedValue(null);

    await expect(useCase.execute('999', updateBusinessDto)).rejects.toThrow(
      NotFoundException,
    );
    expect(findByIdSpy).toHaveBeenCalledWith('999');
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
