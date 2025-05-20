import { Role, Provider } from '@prisma/client';
import { createMockProductResponseDto } from './product-use-cases.mock';
import { AuthUser } from '../../auth/domain/interfaces/user.interface';
import { UploadedFileType } from '../../cloudinary/domain/interfaces/file-upload.interface';

export const createMockAuthUser = (
  overrides: Partial<AuthUser> = {},
): AuthUser => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: Role.BUSINESS,
  provider: Provider.LOCAL,
  businessId: 1,
  ...overrides,
});

export const createMockRequestWithUser = ({ user }: { user: AuthUser }) => ({
  user,
});

export const createMockUserWithBusiness = () => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: Role.BUSINESS,
  provider: Provider.LOCAL,
  businessId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createMockProductsArray = () => [
  createMockProductResponseDto({ id: 1 }),
  createMockProductResponseDto({ id: 2 }),
];

export const createMockUploadedFile = (): UploadedFileType => ({
  fieldname: 'file',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('test'),
  size: 1024,
});

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

export const createMockRepositories = () => ({
  usersRepository: {
    findById: jest.fn(),
  },
  businessRepository: {
    findById: jest.fn(),
  },
});
