import { OrderStatus, Provider, Role } from '@prisma/client';
import { AuthUser } from '../../auth/domain/interfaces/user.interface';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { UpdateOrderStatusDto } from '../application/dtos/update-order-status.dto';
import { GetOrdersQueryDto } from '../application/dtos/get-orders-query.dto';
import { OrderResponseDto } from '../application/dtos/order-response.dto';
import { PaginatedOrdersResponseDto } from '../application/dtos/paginated-orders-response.dto';

// Mock the use cases
export const createMockCreateOrderUseCase = () => ({
  execute: jest.fn(),
});

export const createMockUpdateOrderStatusUseCase = () => ({
  execute: jest.fn(),
});

export const createMockGetUserOrdersUseCase = () => ({
  execute: jest.fn(),
});

export const createMockGetBusinessOrdersUseCase = () => ({
  execute: jest.fn(),
});

// Create mock order response
export const createMockOrderResponse = (
  override: Partial<OrderResponseDto> = {},
): OrderResponseDto => ({
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

// Create mock paginated orders response
export const createMockPaginatedOrdersResponse = (
  override: Partial<PaginatedOrdersResponseDto> = {},
): PaginatedOrdersResponseDto => ({
  data: [createMockOrderResponse(), createMockOrderResponse({ id: 2 })],
  meta: {
    page: 1,
    pageSize: 10,
    totalItems: 2,
    totalPages: 1,
  },
  ...override,
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

// Type for paginated orders response
export interface MockPaginatedOrdersResponse {
  data: MockOrderResponse[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
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

// Create a mock business user
export const createMockBusinessUser = (
  override: Partial<AuthUser> = {},
): AuthUser => ({
  id: 2,
  email: 'business@example.com',
  name: 'Business User',
  role: Role.BUSINESS,
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

// Create a mock update order status DTO
export const createMockUpdateOrderStatusDto = (
  override: Partial<UpdateOrderStatusDto> = {},
): UpdateOrderStatusDto => ({
  status: OrderStatus.IN_PROCESS,
  ...override,
});

// Create a mock order query DTO
export const createMockOrdersQueryDto = (
  override: Partial<GetOrdersQueryDto> = {},
): GetOrdersQueryDto => ({
  page: 1,
  pageSize: 10,
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

// Helper for simulating updateOrderStatus
export const simulateUpdateOrderStatus = (
  useCase: {
    execute: (
      id: number,
      dto: UpdateOrderStatusDto,
      userId: number,
      userRole: Role,
    ) => Promise<MockOrderResponse>;
  },
  id: number,
  dto: UpdateOrderStatusDto,
  userId: number,
  userRole: Role,
): Promise<MockOrderResponse> => {
  return useCase.execute(id, dto, userId, userRole);
};

// Helper for simulating getUserOrders
export const simulateGetUserOrders = (
  useCase: {
    execute: (
      userId: number,
      query: GetOrdersQueryDto,
    ) => Promise<MockPaginatedOrdersResponse>;
  },
  userId: number,
  query: GetOrdersQueryDto,
): Promise<MockPaginatedOrdersResponse> => {
  return useCase.execute(userId, query);
};

// Helper for simulating getBusinessOrders
export const simulateGetBusinessOrders = (
  useCase: {
    execute: (
      businessId: number,
      query: GetOrdersQueryDto,
    ) => Promise<MockPaginatedOrdersResponse>;
  },
  businessId: number,
  query: GetOrdersQueryDto,
): Promise<MockPaginatedOrdersResponse> => {
  return useCase.execute(businessId, query);
};

// Create provider configurations for test module
export const createOrdersTestProviders = () => [
  {
    provide: 'CreateOrderUseCase',
    useValue: createMockCreateOrderUseCase(),
  },
  {
    provide: 'UpdateOrderStatusUseCase',
    useValue: createMockUpdateOrderStatusUseCase(),
  },
  {
    provide: 'GetUserOrdersUseCase',
    useValue: createMockGetUserOrdersUseCase(),
  },
  {
    provide: 'GetBusinessOrdersUseCase',
    useValue: createMockGetBusinessOrdersUseCase(),
  },
];
