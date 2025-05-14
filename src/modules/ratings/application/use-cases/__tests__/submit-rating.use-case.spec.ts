import { Test, TestingModule } from '@nestjs/testing';
import { SubmitRatingUseCase } from '../submit-rating.use-case';
import { RatingsRepository } from '../../../infrastructure/repositories/ratings.repository';
import { OrdersRepository } from '../../../../orders/infrastructure/repositories/orders.repository';
import { ProductsRepository } from '../../../../products/infrastructure/repositories/products.repository';
import { CreateRatingDto } from '../../dtos/create-rating.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import {
  mockRatings,
  mockProduct,
  mockOrder,
  mockPendingOrder,
} from '../../../__mocks__/ratings.mock';

describe('SubmitRatingUseCase', () => {
  let useCase: SubmitRatingUseCase;
  let ratingsRepositoryMock: Partial<RatingsRepository>;
  let ordersRepositoryMock: Partial<OrdersRepository>;
  let productsRepositoryMock: Partial<ProductsRepository>;

  const userId = 123;
  const mockRating = mockRatings[0];

  beforeEach(async () => {
    ratingsRepositoryMock = {
      findByUserAndProduct: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockRating),
    };

    ordersRepositoryMock = {
      findAll: jest.fn().mockResolvedValue([mockOrder]),
    };

    productsRepositoryMock = {
      findById: jest.fn().mockResolvedValue(mockProduct),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitRatingUseCase,
        {
          provide: RatingsRepository,
          useValue: ratingsRepositoryMock,
        },
        {
          provide: OrdersRepository,
          useValue: ordersRepositoryMock,
        },
        {
          provide: ProductsRepository,
          useValue: productsRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<SubmitRatingUseCase>(SubmitRatingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a rating successfully', async () => {
      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };

      const result = await useCase.execute(userId, createRatingDto);

      expect(ratingsRepositoryMock.findByUserAndProduct).toHaveBeenCalledWith(
        userId,
        createRatingDto.productId,
      );
      expect(ordersRepositoryMock.findAll).toHaveBeenCalledWith(userId);
      expect(productsRepositoryMock.findById).toHaveBeenCalledWith(
        createRatingDto.productId,
      );
      expect(ratingsRepositoryMock.create).toHaveBeenCalledWith({
        userId,
        productId: createRatingDto.productId,
        businessId: mockProduct.businessId,
        rating: createRatingDto.rating,
        comment: createRatingDto.comment,
      });
      expect(result).toEqual(mockRating);
    });

    it('should throw BadRequestException if user already rated the product', async () => {
      (
        ratingsRepositoryMock.findByUserAndProduct as jest.Mock
      ).mockResolvedValueOnce(mockRating);

      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };

      await expect(useCase.execute(userId, createRatingDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(ratingsRepositoryMock.findByUserAndProduct).toHaveBeenCalledWith(
        userId,
        createRatingDto.productId,
      );
      expect(ordersRepositoryMock.findAll).not.toHaveBeenCalled();
      expect(productsRepositoryMock.findById).not.toHaveBeenCalled();
      expect(ratingsRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user has not purchased the product', async () => {
      (ordersRepositoryMock.findAll as jest.Mock).mockResolvedValueOnce([]);

      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };

      await expect(useCase.execute(userId, createRatingDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(ratingsRepositoryMock.findByUserAndProduct).toHaveBeenCalledWith(
        userId,
        createRatingDto.productId,
      );
      expect(ordersRepositoryMock.findAll).toHaveBeenCalledWith(userId);
      expect(productsRepositoryMock.findById).not.toHaveBeenCalled();
      expect(ratingsRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user has not completed the order', async () => {
      (ordersRepositoryMock.findAll as jest.Mock).mockResolvedValueOnce([
        mockPendingOrder,
      ]);

      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };

      await expect(useCase.execute(userId, createRatingDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(ratingsRepositoryMock.findByUserAndProduct).toHaveBeenCalledWith(
        userId,
        createRatingDto.productId,
      );
      expect(ordersRepositoryMock.findAll).toHaveBeenCalledWith(userId);
      expect(productsRepositoryMock.findById).not.toHaveBeenCalled();
      expect(ratingsRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if product is not found', async () => {
      (productsRepositoryMock.findById as jest.Mock).mockResolvedValueOnce(
        null,
      );

      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };

      await expect(useCase.execute(userId, createRatingDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(ratingsRepositoryMock.findByUserAndProduct).toHaveBeenCalledWith(
        userId,
        createRatingDto.productId,
      );
      expect(ordersRepositoryMock.findAll).toHaveBeenCalledWith(userId);
      expect(productsRepositoryMock.findById).toHaveBeenCalledWith(
        createRatingDto.productId,
      );
      expect(ratingsRepositoryMock.create).not.toHaveBeenCalled();
    });
  });
});
