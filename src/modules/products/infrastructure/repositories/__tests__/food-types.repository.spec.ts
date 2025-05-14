import { Test, TestingModule } from '@nestjs/testing';
import { FoodTypesRepository } from '../food-types.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  MockPrismaService,
  createMockPrismaService,
  createMockFoodType,
} from '../../../__mocks__/food-types-repository.mock';

describe('FoodTypesRepository', () => {
  let repository: FoodTypesRepository;
  let mockPrismaService: MockPrismaService;

  beforeEach(async () => {
    // Create a mock of the PrismaService
    mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodTypesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<FoodTypesRepository>(FoodTypesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a food type', async () => {
      // Arrange
      const foodTypeData = { name: 'Test Food Type' };
      const expectedFoodType = createMockFoodType();

      mockPrismaService.foodType.create.mockResolvedValue(expectedFoodType);

      // Act
      const result = await repository.create(foodTypeData);

      // Assert
      expect(mockPrismaService.foodType.create).toHaveBeenCalledWith({
        data: foodTypeData,
      });
      expect(result).toEqual(expectedFoodType);
    });
  });

  describe('findAll', () => {
    it('should return all food types', async () => {
      // Arrange
      const expectedFoodTypes = [createMockFoodType()];

      mockPrismaService.foodType.findMany.mockResolvedValue(expectedFoodTypes);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrismaService.foodType.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedFoodTypes);
    });
  });

  describe('findById', () => {
    it('should find a food type by id', async () => {
      // Arrange
      const foodTypeId = 1;
      const expectedFoodType = createMockFoodType();

      mockPrismaService.foodType.findUnique.mockResolvedValue(expectedFoodType);

      // Act
      const result = await repository.findById(foodTypeId);

      // Assert
      expect(mockPrismaService.foodType.findUnique).toHaveBeenCalledWith({
        where: { id: foodTypeId },
      });
      expect(result).toEqual(expectedFoodType);
    });

    it('should return null if food type not found', async () => {
      // Arrange
      const foodTypeId = 999;
      mockPrismaService.foodType.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findById(foodTypeId);

      // Assert
      expect(mockPrismaService.foodType.findUnique).toHaveBeenCalledWith({
        where: { id: foodTypeId },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a food type', async () => {
      // Arrange
      const foodTypeId = 1;
      const updateData = { name: 'Updated Food Type' };
      const expectedFoodType = createMockFoodType({
        name: 'Updated Food Type',
      });

      mockPrismaService.foodType.update.mockResolvedValue(expectedFoodType);

      // Act
      const result = await repository.update(foodTypeId, updateData);

      // Assert
      expect(mockPrismaService.foodType.update).toHaveBeenCalledWith({
        where: { id: foodTypeId },
        data: updateData,
      });
      expect(result).toEqual(expectedFoodType);
    });
  });

  describe('delete', () => {
    it('should delete a food type', async () => {
      // Arrange
      const foodTypeId = 1;
      mockPrismaService.foodType.delete.mockResolvedValue(undefined);

      // Act
      await repository.delete(foodTypeId);

      // Assert
      expect(mockPrismaService.foodType.delete).toHaveBeenCalledWith({
        where: { id: foodTypeId },
      });
    });
  });
});
