import { Rating } from '../domain/entities/rating.entity';
import { Product } from '../../products/domain/entities/product.entity';
import { OrderStatus, Role, Provider } from '@prisma/client';
import { AuthUser } from '../../auth/domain/interfaces/user.interface';

// Mock ratings for testing
export const mockRatings = [
  {
    id: 1,
    userId: 123,
    productId: 456,
    businessId: 789,
    rating: 4,
    comment: 'Great product!',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    user: {
      id: 123,
      name: 'Test User',
    },
    product: {
      id: 456,
      name: 'Test Product',
    },
  },
  {
    id: 2,
    userId: 124,
    productId: 456,
    businessId: 789,
    rating: 5,
    comment: 'Excellent service!',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10'),
    user: {
      id: 124,
      name: 'Another User',
    },
    product: {
      id: 456,
      name: 'Test Product',
    },
  },
] as Rating[];

// Mock product for testing
export const mockProduct = {
  id: 456,
  name: 'Test Product',
  description: 'A test product',
  price: 19.99,
  businessId: 789,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Product;

// Mock order for testing
export const mockOrder = {
  id: 1,
  userId: 123,
  productId: 456,
  quantity: 1,
  status: OrderStatus.COMPLETED,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock completed order
export const mockCompletedOrder = {
  ...mockOrder,
  status: OrderStatus.COMPLETED,
};

// Mock pending order
export const mockPendingOrder = {
  ...mockOrder,
  status: OrderStatus.PENDING,
};

// Mock user (with USER role)
export const mockUser: AuthUser = {
  id: 2,
  email: 'business@example.com',
  name: 'Business User',
  role: Role.USER,
  provider: Provider.LOCAL,
};
