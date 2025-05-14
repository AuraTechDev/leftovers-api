import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderStatusUseCase } from '../update-order-status.use-case';
import { OrdersRepository } from '../../../infrastructure/repositories/orders.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  createMockOrdersRepository,
  createMockOrder,
} from '../../../__mocks__/order-use-cases.mock';
import { createMockUpdateOrderStatusDto } from '../../../__mocks__/order-controllers.mock';

describe('UpdateOrderStatusUseCase', () => {
  let useCase: UpdateOrderStatusUseCase;
  let mockOrdersRepository: ReturnType<typeof createMockOrdersRepository>;

  beforeEach(async () => {
    mockOrdersRepository = createMockOrdersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderStatusUseCase,
        {
          provide: OrdersRepository,
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateOrderStatusUseCase>(UpdateOrderStatusUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const orderId = 1;
    const userId = 3;
    const businessId = 3;
    const updateDto = createMockUpdateOrderStatusDto();

    it('should update order status when user is authorized', async () => {
      // Arrange
      const mockOrder = createMockOrder({ businessId });
      const mockUpdatedOrder = {
        ...mockOrder,
        status: updateDto.status,
      };

      mockOrdersRepository.findById.mockResolvedValue(mockOrder);
      mockOrdersRepository.updateStatus.mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await useCase.execute(
        orderId,
        updateDto,
        businessId, // Business owner ID matches order's businessId
        Role.BUSINESS,
      );

      // Assert
      expect(mockOrdersRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrdersRepository.updateStatus).toHaveBeenCalledWith(
        orderId,
        updateDto.status,
      );
      expect(result.status).toEqual(updateDto.status);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      // Arrange
      mockOrdersRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(orderId, updateDto, userId, Role.BUSINESS),
      ).rejects.toThrow(NotFoundException);

      expect(mockOrdersRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrdersRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when BUSINESS user not authorized', async () => {
      // Arrange
      const mockOrder = createMockOrder({ businessId: 999 }); // Different businessId
      mockOrdersRepository.findById.mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(
        useCase.execute(orderId, updateDto, userId, Role.BUSINESS),
      ).rejects.toThrow(ForbiddenException);

      expect(mockOrdersRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrdersRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should allow SUPER_ADMIN to update any order status', async () => {
      // Arrange
      const mockOrder = createMockOrder();
      const mockUpdatedOrder = {
        ...mockOrder,
        status: updateDto.status,
      };

      mockOrdersRepository.findById.mockResolvedValue(mockOrder);
      mockOrdersRepository.updateStatus.mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await useCase.execute(
        orderId,
        updateDto,
        999, // Different ID (not matching businessId)
        Role.SUPER_ADMIN,
      );

      // Assert
      expect(mockOrdersRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrdersRepository.updateStatus).toHaveBeenCalledWith(
        orderId,
        updateDto.status,
      );
      expect(result.status).toEqual(updateDto.status);
    });
  });
});
