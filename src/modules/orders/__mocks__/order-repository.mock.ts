import { OrderStatus } from '@prisma/client';
import { Order } from '../domain/entities/order.entity';

// Type for the order repository mock PrismaService
export interface MockPrismaService {
  order: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
}

// Mock for PrismaService
export const createMockPrismaService = (): MockPrismaService => ({
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

// Mock order data
export const createMockOrderData = (): Omit<
  Order,
  'id' | 'createdAt' | 'updatedAt'
> => ({
  userId: 1,
  productId: 2,
  businessId: 3,
  quantity: 2,
  status: OrderStatus.PENDING,
  pickupTime: new Date(),
});

// Mock order entity
export const createMockOrder = (override: Partial<Order> = {}): Order => ({
  id: 1,
  userId: 1,
  productId: 2,
  businessId: 3,
  quantity: 2,
  status: OrderStatus.PENDING,
  pickupTime: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

// Mock order with relations
export const createMockOrderWithRelations = (
  override: Partial<
    Order & {
      product: any;
      user: any;
      business: any;
    }
  > = {},
) => ({
  id: 1,
  userId: 1,
  productId: 2,
  businessId: 3,
  quantity: 2,
  status: OrderStatus.PENDING,
  pickupTime: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  product: { id: 2 },
  user: { id: 1 },
  business: { id: 3 },
  ...override,
});
