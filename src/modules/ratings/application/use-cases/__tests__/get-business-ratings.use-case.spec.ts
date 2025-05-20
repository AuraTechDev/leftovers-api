import { Test, TestingModule } from '@nestjs/testing';
import { GetBusinessRatingsUseCase } from '../get-business-ratings.use-case';
import { RatingsRepository } from '../../../infrastructure/repositories/ratings.repository';
import { BusinessRatingsQueryDto } from '../../dtos/business-ratings-query.dto';
import { mockRatings } from '../../../__mocks__/ratings.mock';

describe('GetBusinessRatingsUseCase', () => {
  let useCase: GetBusinessRatingsUseCase;
  let ratingsRepositoryMock: Partial<RatingsRepository>;

  beforeEach(async () => {
    ratingsRepositoryMock = {
      findByBusiness: jest.fn().mockResolvedValue(mockRatings),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBusinessRatingsUseCase,
        {
          provide: RatingsRepository,
          useValue: ratingsRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<GetBusinessRatingsUseCase>(GetBusinessRatingsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return business ratings without filters', async () => {
      const businessId = 789;
      const query = new BusinessRatingsQueryDto();

      const result = await useCase.execute(businessId, query);

      expect(ratingsRepositoryMock.findByBusiness).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({
          productId: undefined,
          ratingValue: undefined,
          startDate: undefined,
          endDate: undefined,
        }),
      );
      expect(result).toEqual(mockRatings);
    });

    it('should return business ratings with product filter', async () => {
      const businessId = 789;
      const query = new BusinessRatingsQueryDto();
      query.productId = 456;

      const result = await useCase.execute(businessId, query);

      expect(ratingsRepositoryMock.findByBusiness).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({
          productId: 456,
        }),
      );
      expect(result).toEqual(mockRatings);
    });

    it('should return business ratings with date range filter', async () => {
      const businessId = 789;
      const query = new BusinessRatingsQueryDto();
      query.startDate = '2023-01-01';
      query.endDate = '2023-12-31';

      const result = await useCase.execute(businessId, query);

      expect(ratingsRepositoryMock.findByBusiness).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          startDate: expect.any(Date),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endDate: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockRatings);
    });

    it('should return business ratings with rating value filter', async () => {
      const businessId = 789;
      const query = new BusinessRatingsQueryDto();
      query.ratingValue = 4;

      const result = await useCase.execute(businessId, query);

      expect(ratingsRepositoryMock.findByBusiness).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({
          ratingValue: 4,
        }),
      );
      expect(result).toEqual(mockRatings);
    });

    it('should pass all filters to repository', async () => {
      const businessId = 789;
      const query = new BusinessRatingsQueryDto();
      query.productId = 456;
      query.ratingValue = 5;
      query.startDate = '2023-01-01';
      query.endDate = '2023-12-31';

      const result = await useCase.execute(businessId, query);

      expect(ratingsRepositoryMock.findByBusiness).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({
          productId: 456,
          ratingValue: 5,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          startDate: expect.any(Date),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endDate: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockRatings);
    });
  });
});
