import { Role, Provider } from '@prisma/client';
import { ProductResponseDto } from '../application/dtos/product-response.dto';
import { FoodTypeResponseDto } from '../application/dtos/food-type-response.dto';
import { createMockProductResponseDto } from './product-use-cases.mock';
import { createMockFoodTypeResponseDto } from './food-type.mock';
import { UploadedFileType } from '../../cloudinary/interfaces/file-upload.interface';

// Define AuthUser interface locally to avoid import issues
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  photoUrl?: string;
  provider: Provider;
  businessId?: number;
}

// Mock for Request with AuthUser
export interface RequestWithUser extends Request {
  user: AuthUser;
}

// Create a more complete Request mock that extends the actual Request interface
export const createMockRequestWithUser = (
  override: Partial<{ user: AuthUser }> = {},
): RequestWithUser => {
  const req = {
    user: createMockAuthUser(),
    headers: {},
    url: '',
    method: 'GET',
    // Add all other required properties from the Request interface
    cache: {} as RequestCache,
    credentials: 'omit' as RequestCredentials,
    destination: '' as RequestDestination,
    integrity: '',
    keepalive: false,
    mode: 'cors' as RequestMode,
    redirect: 'follow' as RequestRedirect,
    referrer: '',
    referrerPolicy: '' as ReferrerPolicy,
    signal: {} as AbortSignal,
    // Add methods
    clone: jest.fn().mockReturnThis(),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: jest.fn().mockResolvedValue(new Blob()),
    formData: jest.fn().mockResolvedValue(new FormData()),
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    // Body properties and methods
    body: null,
    bodyUsed: false,
    ...override,
  };
  return req as unknown as RequestWithUser;
};

// Create mock user with auth data
export const createMockAuthUser = (
  override: Partial<AuthUser> = {},
): AuthUser => ({
  id: 1,
  email: 'test@example.com',
  role: Role.BUSINESS,
  name: 'Test User',
  provider: Provider.LOCAL,
  businessId: 1,
  ...override,
});

// Create mock uploaded file helper function
export const createMockUploadedFile = (
  override: Partial<UploadedFileType> = {},
): UploadedFileType => ({
  fieldname: 'file',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('test image data'),
  size: 1024,
  ...override,
});

// Mock for all Product Use Cases
export const createMockProductUseCases = () => ({
  createProductUseCase: {
    execute: jest.fn(),
  },
  getAllProductsUseCase: {
    execute: jest.fn(),
  },
  getProductUseCase: {
    execute: jest.fn(),
  },
  updateProductUseCase: {
    execute: jest.fn(),
  },
  deleteProductUseCase: {
    execute: jest.fn(),
  },
  uploadProductImageUseCase: {
    execute: jest.fn(),
  },
  toggleProductPropertyUseCase: {
    execute: jest.fn(),
  },
});

// Mock for all Food Type Use Cases
export const createMockFoodTypeUseCases = () => ({
  createFoodTypeUseCase: {
    execute: jest.fn(),
  },
  getAllFoodTypesUseCase: {
    execute: jest.fn(),
  },
  updateFoodTypeUseCase: {
    execute: jest.fn(),
  },
  deleteFoodTypeUseCase: {
    execute: jest.fn(),
  },
});

// Mock for Repositories
export const createMockRepositories = () => ({
  usersRepository: {
    findById: jest.fn(),
  },
  businessRepository: {
    findById: jest.fn(),
  },
});

// Mock for user with business relationship
export const createMockUserWithBusiness = (
  override: Partial<{
    id: number;
    email: string;
    name: string;
    businessId: number | null;
    provider: Provider;
    role: Role;
  }> = {},
) => ({
  id: 1,
  email: 'business@example.com',
  name: 'Business User',
  businessId: 1,
  provider: Provider.LOCAL,
  role: Role.BUSINESS,
  ...override,
});

// Mock responses for different endpoints
export const createMockProductsArray = (count = 3): ProductResponseDto[] => {
  return Array(count)
    .fill(null)
    .map((_, index) =>
      createMockProductResponseDto({
        id: index + 1,
        name: `Product ${index + 1}`,
      }),
    );
};

export const createMockFoodTypesArray = (count = 3): FoodTypeResponseDto[] => {
  return Array(count)
    .fill(null)
    .map((_, index) =>
      createMockFoodTypeResponseDto({
        id: index + 1,
        name: `Food Type ${index + 1}`,
      }),
    );
};

// Mock guards
export const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

export const mockRolesGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

// Mock File Interceptor
export const mockFileInterceptor = {
  // Safe typed version of the interceptor
  intercept: jest.fn().mockImplementation(() => {
    return {
      handle: () => Promise.resolve(),
    };
  }),
};

// Export the interface for use in tests
export { UploadedFileType };
