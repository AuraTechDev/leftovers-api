// Define the Product model structure for mocking
export interface MockProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isDisabled: boolean;
  foodTypeId: number | null;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create a mock product
export const createMockProduct = (
  override: Partial<MockProduct> = {},
): MockProduct => ({
  id: 1,
  name: 'Test Product',
  description: 'Description',
  price: 10.0,
  quantity: 5,
  imageUrl: null,
  isFeatured: false,
  isDisabled: false,
  foodTypeId: null,
  businessId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

// Create variants of products
export const createMockDisabledProduct = () =>
  createMockProduct({ isDisabled: true });

export const createMockOutOfStockProduct = () =>
  createMockProduct({ quantity: 0 });

// Mock for ProductsRepository
export const createMockProductsRepository = () => ({
  findById: jest.fn(),
  decreaseQuantity: jest.fn(),
});

// Create mock type for prisma client object used in tests
// This mimics what the product inventory service expects
export interface MockPrismaClient {
  product: {
    findUnique: jest.Mock;
    update: jest.Mock;
    [key: string]: any;
  };
  // add other needed properties for testing
  $executeRaw: jest.Mock;
  $executeRawUnsafe: jest.Mock;
  $queryRaw: jest.Mock;
  $queryRawUnsafe: jest.Mock;
  $transaction: jest.Mock;
  [key: string]: any;
}

// Create a mock transaction client that works with the type system
export const createMockPrismaTransaction = (): MockPrismaClient => ({
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $transaction: jest.fn(),
});

// Create a mock PrismaService that uses the transaction
export const createMockPrismaService = (
  mockTransaction: MockPrismaClient,
): MockPrismaClient => ({
  $transaction: jest.fn((callback: (tx: MockPrismaClient) => unknown) =>
    Promise.resolve(callback(mockTransaction)),
  ),
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
});
