import { OrderStatus } from '@prisma/client';

// Define types for mocks to avoid 'any' type issues
export type MockPrismaClient = {
  product: {
    findUnique: jest.Mock<any, any>;
    update: jest.Mock<any, any>;
  };
  order: {
    create: jest.Mock<any, any>;
    update: jest.Mock<any, any>;
    findMany: jest.Mock<any, any>;
    count: jest.Mock<any, any>;
  };
};

// Define type for order result
export type OrderResult = {
  id: number;
  userId: number;
  productId: number;
  businessId: number;
  quantity: number;
  status: OrderStatus;
  pickupTime: Date;
  createdAt: Date;
  updatedAt: Date;
  product?: { id: number; name: string };
  user?: { id: number; name: string };
  business?: { id: number; name: string };
};

// Define type for order create args
export interface OrderCreateArgs {
  data: {
    userId: number;
    productId: number;
    businessId: number;
    quantity: number;
    status: OrderStatus;
    pickupTime: Date;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Define type for Prisma order create params with include
export interface PrismaOrderCreateParams {
  data: {
    userId: number;
    productId: number;
    businessId: number;
    quantity: number;
    status: OrderStatus;
    pickupTime: Date;
    [key: string]: unknown;
  };
  include: {
    product: boolean;
    user: boolean;
    business: boolean;
    [key: string]: boolean;
  };
}

// Create mock functions easily
export const createMockFn = <T = any>() => jest.fn<T, any>();

// Mock Prisma Service
export const createMockPrismaService = () => ({
  $transaction: jest.fn(
    (callback: (tx: MockPrismaClient) => Promise<OrderResult>) =>
      callback({
        product: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        order: {
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      }),
  ),
  order: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

// Mock Orders Repository
export const createMockOrdersRepository = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateStatus: jest.fn(),
  findPaginatedByUser: jest.fn(),
  findPaginatedByBusiness: jest.fn(),
});

// Mock Product Inventory Service
export const createMockProductInventoryService = () => ({
  validateAndDecreaseInventory: jest.fn(),
  validateProductForOrder: jest.fn(),
  decreaseInventory: jest.fn(),
});

// Mock Created Order
export const createMockOrder = (
  override: Partial<OrderResult> = {},
): OrderResult => ({
  id: 1,
  userId: 1,
  productId: 2,
  businessId: 3,
  quantity: 2,
  status: OrderStatus.PENDING,
  pickupTime: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  product: { id: 2, name: 'Test Product' },
  user: { id: 1, name: 'Test User' },
  business: { id: 3, name: 'Test Business' },
  ...override,
});

// Mock paginated orders result
export const createMockPaginatedOrdersResult = (
  orders: OrderResult[] = [createMockOrder()],
  total = 1,
) => ({
  orders,
  total,
});
