import { Test, TestingModule } from '@nestjs/testing';
import { GetAllFoodTypesUseCase } from '../get-all-food-types.use-case';
import { FoodTypesRepository } from '../../../infrastructure/repositories/food-types.repository';
import {
  createMockFoodType,
  createMockFoodTypesRepository,
} from '../../../__mocks__/food-type.mock';

// Type for mock repository
type MockFoodTypesRepository = ReturnType<typeof createMockFoodTypesRepository>;

describe('GetAllFoodTypesUseCase', () => {
  let useCase: GetAllFoodTypesUseCase;
  let mockFoodTypesRepository: MockFoodTypesRepository;

  beforeEach(async () => {
    // Create mock repository
    mockFoodTypesRepository = createMockFoodTypesRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllFoodTypesUseCase,
        {
          provide: FoodTypesRepository,
          useValue: mockFoodTypesRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllFoodTypesUseCase>(GetAllFoodTypesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all food types successfully', async () => {
      // Arrange
      const foodTypes = [
        createMockFoodType({ id: 1, name: 'Vegetarian' }),
        createMockFoodType({ id: 2, name: 'Vegan' }),
        createMockFoodType({ id: 3, name: 'Gluten-free' }),
      ];

      mockFoodTypesRepository.findAll.mockResolvedValue(foodTypes);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockFoodTypesRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(
        expect.objectContaining({ id: 1, name: 'Vegetarian' }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({ id: 2, name: 'Vegan' }),
      );
      expect(result[2]).toEqual(
        expect.objectContaining({ id: 3, name: 'Gluten-free' }),
      );
    });

    it('should return empty array when no food types exist', async () => {
      // Arrange
      mockFoodTypesRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockFoodTypesRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should propagate any errors from the repository', async () => {
      // Arrange
      const genericError = new Error('Database error');
      mockFoodTypesRepository.findAll.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(genericError);
      expect(mockFoodTypesRepository.findAll).toHaveBeenCalled();
    });
  });
});
