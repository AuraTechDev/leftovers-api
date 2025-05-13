# Cloudinary Module

This module provides integration with Cloudinary for uploading images from the API.

## Configuration

To use this module, you need to configure the following environment variables:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

You can obtain these credentials from your Cloudinary dashboard.

## Usage

### Uploading an image

You can upload an image using the `POST /uploads/image` endpoint. This endpoint expects a multipart form with a `file` field containing the image to upload. Optionally, you can include a `folder` field to specify the folder in Cloudinary where the image will be stored.

Example response:

```json
{
  "publicId": "folder/image_id",
  "url": "https://res.cloudinary.com/your_cloud_name/image/upload/folder/image_id.jpg",
  "originalFilename": "original_image.jpg"
}
```

### Using in code

If you need to use the Cloudinary service in other modules:

1. Import the `CloudinaryModule` in your module:

```typescript
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  // ...
})
export class YourModule {}
```

2. Inject the `CloudinaryService` in your service or controller:

```typescript
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class YourService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async uploadImage(file: Buffer | string, folder?: string) {
    const result = await this.cloudinaryService.uploadImage(file, folder);
    return result;
  }
}
```

## Dependencies

If you have issues with Multer, make sure you have installed:

```bash
npm install --save @nestjs/platform-express
# or
pnpm add @nestjs/platform-express
```
