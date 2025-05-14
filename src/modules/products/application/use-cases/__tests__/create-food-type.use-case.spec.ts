import { Test, TestingModule } from '@nestjs/testing';
import { CreateFoodTypeUseCase } from '../create-food-type.use-case';
import { FoodTypesRepository } from '../../../infrastructure/repositories/food-types.repository';
import { ConflictException } from '@nestjs/common';
import {
  createMockFoodType,
  createMockFoodTypeDto,
  createMockFoodTypeResponseDto,
  createMockFoodTypesRepository,
  createPrismaUniqueConstraintError,
} from '../../../__mocks__/food-type.mock';

// Type for mock repository
type MockFoodTypesRepository = ReturnType<typeof createMockFoodTypesRepository>;

describe('CreateFoodTypeUseCase', () => {
  let useCase: CreateFoodTypeUseCase;
  let mockFoodTypesRepository: MockFoodTypesRepository;

  beforeEach(async () => {
    // Create mock repository
    mockFoodTypesRepository = createMockFoodTypesRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFoodTypeUseCase,
        {
          provide: FoodTypesRepository,
          useValue: mockFoodTypesRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateFoodTypeUseCase>(CreateFoodTypeUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new food type successfully', async () => {
      // Arrange
      const dto = createMockFoodTypeDto();
      const createdFoodType = createMockFoodType();
      const expectedResponse = createMockFoodTypeResponseDto();

      mockFoodTypesRepository.create.mockResolvedValue(createdFoodType);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(mockFoodTypesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
        }),
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw ConflictException when food type with same name already exists', async () => {
      // Arrange
      const dto = createMockFoodTypeDto('Vegetarian');
      const error = createPrismaUniqueConstraintError();

      mockFoodTypesRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockFoodTypesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
        }),
      );
    });

    it('should rethrow any other error', async () => {
      // Arrange
      const dto = createMockFoodTypeDto();
      const genericError = new Error('Database error');

      mockFoodTypesRepository.create.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(genericError);
      expect(mockFoodTypesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
        }),
      );
    });
  });
});
