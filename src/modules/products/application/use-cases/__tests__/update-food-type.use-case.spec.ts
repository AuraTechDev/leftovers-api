import { Test, TestingModule } from '@nestjs/testing';
import { UpdateFoodTypeUseCase } from '../update-food-type.use-case';
import { FoodTypesRepository } from '../../../infrastructure/repositories/food-types.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  createMockFoodType,
  createMockUpdateFoodTypeDto,
  createMockFoodTypesRepository,
  createPrismaUniqueConstraintError,
} from '../../../__mocks__/food-type.mock';

// Type for mock repository
type MockFoodTypesRepository = ReturnType<typeof createMockFoodTypesRepository>;

describe('UpdateFoodTypeUseCase', () => {
  let useCase: UpdateFoodTypeUseCase;
  let mockFoodTypesRepository: MockFoodTypesRepository;

  beforeEach(async () => {
    // Create mock repository
    mockFoodTypesRepository = createMockFoodTypesRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateFoodTypeUseCase,
        {
          provide: FoodTypesRepository,
          useValue: mockFoodTypesRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateFoodTypeUseCase>(UpdateFoodTypeUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a food type successfully', async () => {
      // Arrange
      const foodTypeId = 1;
      const existingFoodType = createMockFoodType({
        id: foodTypeId,
        name: 'Vegetarian',
      });
      const updateDto = createMockUpdateFoodTypeDto('Updated Vegetarian');
      const updatedFoodType = createMockFoodType({
        id: foodTypeId,
        name: 'Updated Vegetarian',
        updatedAt: new Date(),
      });

      mockFoodTypesRepository.findById.mockResolvedValue(existingFoodType);
      mockFoodTypesRepository.update.mockResolvedValue(updatedFoodType);

      // Act
      const result = await useCase.execute(foodTypeId, updateDto);

      // Assert
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.update).toHaveBeenCalledWith(
        foodTypeId,
        updateDto,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: foodTypeId,
          name: 'Updated Vegetarian',
        }),
      );
    });

    it('should throw NotFoundException when food type does not exist', async () => {
      // Arrange
      const foodTypeId = 999;
      const updateDto = createMockUpdateFoodTypeDto();

      mockFoodTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(foodTypeId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when trying to update to a name that already exists', async () => {
      // Arrange
      const foodTypeId = 1;
      const existingFoodType = createMockFoodType({ id: foodTypeId });
      const updateDto = createMockUpdateFoodTypeDto('Existing Name');
      const uniqueConstraintError = createPrismaUniqueConstraintError();

      mockFoodTypesRepository.findById.mockResolvedValue(existingFoodType);
      mockFoodTypesRepository.update.mockRejectedValue(uniqueConstraintError);

      // Act & Assert
      await expect(useCase.execute(foodTypeId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.update).toHaveBeenCalledWith(
        foodTypeId,
        updateDto,
      );
    });

    it('should propagate any other errors from the repository', async () => {
      // Arrange
      const foodTypeId = 1;
      const existingFoodType = createMockFoodType({ id: foodTypeId });
      const updateDto = createMockUpdateFoodTypeDto();
      const genericError = new Error('Database error');

      mockFoodTypesRepository.findById.mockResolvedValue(existingFoodType);
      mockFoodTypesRepository.update.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(foodTypeId, updateDto)).rejects.toThrow(
        genericError,
      );
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.update).toHaveBeenCalledWith(
        foodTypeId,
        updateDto,
      );
    });
  });
});
