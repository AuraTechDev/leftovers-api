import { Test, TestingModule } from '@nestjs/testing';
import { BusinessRepository } from '../business.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Business } from '../../../domain/entities/business.entity';

describe('BusinessRepository', () => {
  let repository: BusinessRepository;

  const mockPrismaBusiness = {
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

  const mockBusinessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'New Business',
    description: 'New Description',
    address: '456 New St',
    latitude: 41.8781,
    longitude: -87.6298,
    contactEmail: 'new@example.com',
    phone: '555-5678',
    logoUrl: 'https://example.com/new-logo.png',
    openingHours: '10:00-18:00',
  };

  const mockPrisma = {
    business: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<BusinessRepository>(BusinessRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a business', async () => {
      mockPrisma.business.create.mockResolvedValue(mockPrismaBusiness);

      const result = await repository.create(mockBusinessData);

      expect(mockPrisma.business.create).toHaveBeenCalledWith({
        data: mockBusinessData,
      });
      expect(result).toEqual(mockPrismaBusiness);
    });
  });

  describe('findAll', () => {
    it('should return all businesses', async () => {
      mockPrisma.business.findMany.mockResolvedValue([mockPrismaBusiness]);

      const result = await repository.findAll();

      expect(mockPrisma.business.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockPrismaBusiness]);
    });
  });

  describe('findById', () => {
    it('should find a business by id', async () => {
      mockPrisma.business.findUnique.mockResolvedValue(mockPrismaBusiness);

      const result = await repository.findById(1);

      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPrismaBusiness);
    });

    it('should return null when business not found', async () => {
      mockPrisma.business.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a business', async () => {
      const updateData = {
        name: 'Updated Business',
        description: 'Updated Description',
      };

      const updatedBusiness = {
        ...mockPrismaBusiness,
        ...updateData,
      };

      mockPrisma.business.update.mockResolvedValue(updatedBusiness);

      const result = await repository.update(1, updateData);

      expect(mockPrisma.business.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedBusiness);
    });
  });

  describe('delete', () => {
    it('should delete a business', async () => {
      mockPrisma.business.delete.mockResolvedValue(mockPrismaBusiness);

      await repository.delete(1);

      expect(mockPrisma.business.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
