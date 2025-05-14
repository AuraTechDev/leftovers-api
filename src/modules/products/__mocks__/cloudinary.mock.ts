import { UploadApiResponse } from 'cloudinary';

// Mock Cloudinary upload result (simplified for tests)
export const createMockCloudinaryUploadResult = (
  override: Partial<UploadApiResponse> = {},
): UploadApiResponse =>
  ({
    public_id: 'test-product-image',
    secure_url:
      'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/products/test-product-image.jpg',
    format: 'jpg',
    version: 1234567890,
    resource_type: 'image',
    created_at: new Date().toISOString(),
    ...override,
  }) as UploadApiResponse;

// Mock CloudinaryService
export const createMockCloudinaryService = () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
});
