import { Test, TestingModule } from '@nestjs/testing';
import { DeleteFoodTypeUseCase } from '../delete-food-type.use-case';
import { FoodTypesRepository } from '../../../infrastructure/repositories/food-types.repository';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  createMockFoodType,
  createMockFoodTypesRepository,
  createPrismaForeignKeyConstraintError,
} from '../../../__mocks__/food-type.mock';
import { createMockProductsRepository } from '../../../__mocks__/product-use-cases.mock';

// Type for mock repositories
type MockFoodTypesRepository = ReturnType<typeof createMockFoodTypesRepository>;
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('DeleteFoodTypeUseCase', () => {
  let useCase: DeleteFoodTypeUseCase;
  let mockFoodTypesRepository: MockFoodTypesRepository;
  let mockProductsRepository: MockProductsRepository;

  beforeEach(async () => {
    // Create mock repositories
    mockFoodTypesRepository = createMockFoodTypesRepository();
    mockProductsRepository = createMockProductsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteFoodTypeUseCase,
        {
          provide: FoodTypesRepository,
          useValue: mockFoodTypesRepository,
        },
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteFoodTypeUseCase>(DeleteFoodTypeUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a food type successfully', async () => {
      // Arrange
      const foodTypeId = 1;
      const existingFoodType = createMockFoodType({ id: foodTypeId });

      mockFoodTypesRepository.findById.mockResolvedValue(existingFoodType);
      mockFoodTypesRepository.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute(foodTypeId);

      // Assert
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.delete).toHaveBeenCalledWith(foodTypeId);
    });

    it('should throw NotFoundException when food type does not exist', async () => {
      // Arrange
      const foodTypeId = 999;
      mockFoodTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(foodTypeId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when food type is being used by products', async () => {
      // Arrange
      const foodTypeId = 1;
      const existingFoodType = createMockFoodType({ id: foodTypeId });
      const foreignKeyError = createPrismaForeignKeyConstraintError();

      mockFoodTypesRepository.findById.mockResolvedValue(existingFoodType);
      mockFoodTypesRepository.delete.mockRejectedValue(foreignKeyError);

      // Act & Assert
      await expect(useCase.execute(foodTypeId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.delete).toHaveBeenCalledWith(foodTypeId);
    });

    it('should rethrow any other error', async () => {
      // Arrange
      const foodTypeId = 1;
      const existingFoodType = createMockFoodType({ id: foodTypeId });
      const genericError = new Error('Database error');

      mockFoodTypesRepository.findById.mockResolvedValue(existingFoodType);
      mockFoodTypesRepository.delete.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(foodTypeId)).rejects.toThrow(genericError);
      expect(mockFoodTypesRepository.findById).toHaveBeenCalledWith(foodTypeId);
      expect(mockFoodTypesRepository.delete).toHaveBeenCalledWith(foodTypeId);
    });
  });
});
