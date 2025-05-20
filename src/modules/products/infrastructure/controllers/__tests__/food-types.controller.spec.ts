import { Test, TestingModule } from '@nestjs/testing';
import { FoodTypesController } from '../food-types.controller';
import { CreateFoodTypeUseCase } from '../../../application/use-cases/create-food-type.use-case';
import { GetAllFoodTypesUseCase } from '../../../application/use-cases/get-all-food-types.use-case';
import { UpdateFoodTypeUseCase } from '../../../application/use-cases/update-food-type.use-case';
import { DeleteFoodTypeUseCase } from '../../../application/use-cases/delete-food-type.use-case';
import { CreateFoodTypeDto } from '../../../application/dtos/create-food-type.dto';
import { UpdateFoodTypeDto } from '../../../application/dtos/update-food-type.dto';
import { FoodType } from '@prisma/client';

describe('FoodTypesController', () => {
  let controller: FoodTypesController;

  const mockCreateFoodTypeUseCase = {
    execute: jest.fn(),
  };

  const mockGetAllFoodTypesUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateFoodTypeUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteFoodTypeUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodTypesController],
      providers: [
        {
          provide: CreateFoodTypeUseCase,
          useValue: mockCreateFoodTypeUseCase,
        },
        {
          provide: GetAllFoodTypesUseCase,
          useValue: mockGetAllFoodTypesUseCase,
        },
        {
          provide: UpdateFoodTypeUseCase,
          useValue: mockUpdateFoodTypeUseCase,
        },
        {
          provide: DeleteFoodTypeUseCase,
          useValue: mockDeleteFoodTypeUseCase,
        },
      ],
    }).compile();

    controller = module.get<FoodTypesController>(FoodTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFoodType', () => {
    it('should create a food type', async () => {
      const createFoodTypeDto: CreateFoodTypeDto = {
        name: 'Test Food Type',
      };

      const expectedResponse: FoodType = {
        id: 1,
        name: 'Test Food Type',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateFoodTypeUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.createFoodType(createFoodTypeDto);

      expect(result).toEqual(expectedResponse);
      expect(mockCreateFoodTypeUseCase.execute).toHaveBeenCalledWith(
        createFoodTypeDto,
      );
    });
  });

  describe('getAllFoodTypes', () => {
    it('should return an array of food types', async () => {
      const expectedResponse: FoodType[] = [
        {
          id: 1,
          name: 'Food Type 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Food Type 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetAllFoodTypesUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.getAllFoodTypes();

      expect(result).toEqual(expectedResponse);
      expect(mockGetAllFoodTypesUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('updateFoodType', () => {
    it('should update a food type', async () => {
      const id = 1;
      const updateFoodTypeDto: UpdateFoodTypeDto = {
        name: 'Updated Food Type',
      };

      const expectedResponse: FoodType = {
        id: 1,
        name: 'Updated Food Type',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUpdateFoodTypeUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.updateFoodType(id, updateFoodTypeDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUpdateFoodTypeUseCase.execute).toHaveBeenCalledWith(
        id,
        updateFoodTypeDto,
      );
    });
  });

  describe('deleteFoodType', () => {
    it('should delete a food type', async () => {
      const id = 1;

      mockDeleteFoodTypeUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteFoodType(id);

      expect(mockDeleteFoodTypeUseCase.execute).toHaveBeenCalledWith(id);
    });
  });
});
