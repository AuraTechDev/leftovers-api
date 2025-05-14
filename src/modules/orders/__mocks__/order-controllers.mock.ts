import { OrderStatus, Provider, Role } from '@prisma/client';
import { AuthUser } from '../../auth/domain/interfaces/user.interface';
import { CreateOrderDto } from '../application/dtos/create-order.dto';

// Mock the CreateOrderUseCase
export const createMockCreateOrderUseCase = () => ({
  execute: jest.fn(),
});

// Type for mock order response
export interface MockOrderResponse {
  id: number;
  userId: number;
  productId: number;
  businessId: number;
  quantity: number;
  status: OrderStatus;
  pickupTime: Date;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

// Create a mock user
export const createMockUser = (override: Partial<AuthUser> = {}): AuthUser => ({
  id: 123,
  email: 'test@example.com',
  name: 'Test User',
  role: Role.USER,
  provider: Provider.LOCAL,
  ...override,
});

// Create a mock order DTO
export const createMockOrderDto = (
  override: Partial<CreateOrderDto> = {},
): CreateOrderDto => ({
  userId: 999, // Will be overridden in controller
  productId: 1,
  businessId: 2,
  quantity: 3,
  pickupTime: new Date(),
  ...override,
});

// Create a mock order response
export const createMockOrderResponse = (
  override: Partial<MockOrderResponse> = {},
): MockOrderResponse => ({
  id: 1,
  userId: 123,
  productId: 1,
  businessId: 2,
  quantity: 3,
  status: OrderStatus.PENDING,
  pickupTime: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

// Simple helper function that directly simulates controller behavior
export const simulateCreateOrder = (
  useCase: { execute: (dto: CreateOrderDto) => Promise<MockOrderResponse> },
  dto: CreateOrderDto,
  userId: number,
): Promise<MockOrderResponse> => {
  // Apply the same logic as the controller
  dto.userId = userId;
  return useCase.execute(dto);
};
