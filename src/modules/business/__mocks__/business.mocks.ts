import { Business } from '../domain/entities/business.entity';
import { Role, Provider } from '@prisma/client';
import { AuthUser } from '../../auth/domain/interfaces/user.interface';
import { User } from '../../users/domain/entities/user.entity';
import { BusinessResponseDto } from '../application/dtos/business-response.dto';
import { Buffer } from 'buffer';

/**
 * Mock business entity
 */
export const mockBusiness: Business = {
  id: 1,
  name: 'Test Business',
  description: 'Test Description',
  address: '123 Test St',
  latitude: 40.7128,
  longitude: -74.006,
  contactEmail: 'business@example.com',
  phone: '555-1234',
  logoUrl: 'https://example.com/logo.png',
  bannerUrl: 'https://example.com/banner.jpg',
  openingHours: '9:00-17:00',
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock business entity with logo URL from Cloudinary
 */
export const mockBusinessWithCloudinaryLogo: Business = {
  ...mockBusiness,
  logoUrl:
    'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/old-logo-id.jpg',
};

/**
 * Mock business entity without a logo
 */
export const mockBusinessWithoutLogo: Business = {
  ...mockBusiness,
  logoUrl: null,
};

/**
 * Mock super admin user
 */
export const mockSuperAdmin: AuthUser = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
  role: Role.SUPER_ADMIN,
  provider: Provider.LOCAL,
  businessId: 1, // Same as mockBusiness.id
};

/**
 * Mock business user (with BUSINESS role)
 */
export const mockBusinessUser: AuthUser = {
  id: 2,
  email: 'business@example.com',
  name: 'Business User',
  role: Role.BUSINESS,
  provider: Provider.LOCAL,
  businessId: 1, // Same as mockBusiness.id
};

/**
 * Mock full user object with business relationship
 */
export const mockUserWithBusiness: User = {
  id: 2,
  email: 'business@example.com',
  name: 'Business User',
  password: 'hashedpassword',
  role: Role.BUSINESS,
  provider: Provider.LOCAL,
  businessId: 1, // Same as mockBusiness.id
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock user without business relationship
 */
export const mockUserWithoutBusiness: User = {
  id: 3,
  email: 'user@example.com',
  name: 'Regular User',
  password: 'hashedpassword',
  role: Role.USER,
  provider: Provider.LOCAL,
  businessId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock business response DTO with Cloudinary URL
 */
export const mockBusinessResponse: BusinessResponseDto = {
  ...mockBusiness,
  logoUrl:
    'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/business-logos/new-logo-id.jpg',
};

/**
 * Mock Cloudinary upload result (simplified for tests)
 */
export const mockCloudinaryUploadResult = {
  secure_url:
    'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/business-logos/new-logo-id.jpg',
};

/**
 * Mock uploaded file for multipart/form-data tests
 */
export const mockFile = {
  fieldname: 'file',
  originalname: 'logo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('test image data'),
  size: 1024,
};
