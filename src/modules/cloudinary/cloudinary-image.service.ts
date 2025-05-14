import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

export interface EntityWithImage {
  id: number;
  [imageField: string]: any;
}

export interface EntityRepository<T extends EntityWithImage> {
  findById(id: number): Promise<T | null>;
  update(id: number, data: Partial<T>): Promise<T>;
}

@Injectable()
export class CloudinaryImageService {
  private readonly logger = new Logger(CloudinaryImageService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Extracts the public ID from a Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      return match && match[1] ? match[1] : null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error parsing image URL: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Generic method to handle image uploads for any entity
   */
  async uploadEntityImage<T extends EntityWithImage, R>(params: {
    entityId: number;
    repository: EntityRepository<T>;
    imageBuffer: Buffer;
    cloudinaryFolder: string;
    imageField: keyof T;
    responseTransformer: (entity: T) => R;
  }): Promise<R> {
    // Find the entity
    const entity = await params.repository.findById(params.entityId);

    if (!entity) {
      throw new Error(`Entity with ID ${params.entityId} not found`);
    }

    // Extract old image public ID if exists
    let oldImagePublicId: string | null = null;
    const currentImageUrl = entity[params.imageField] as string;

    if (currentImageUrl) {
      oldImagePublicId = this.extractPublicId(currentImageUrl);
    }

    // Upload new image
    const uploadResult = await this.cloudinaryService.uploadImage(
      params.imageBuffer,
      params.cloudinaryFolder,
    );

    // Update entity with new image URL
    const updateData = {
      [params.imageField]: uploadResult.secure_url,
    } as Partial<T>;

    const updatedEntity = await params.repository.update(
      params.entityId,
      updateData,
    );

    // Try to delete old image if exists
    if (oldImagePublicId) {
      try {
        await this.cloudinaryService.deleteImage(oldImagePublicId);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error deleting old image: ${errorMessage}`);
        this.logger.error(`Failed to delete public ID: ${oldImagePublicId}`);
      }
    }

    // Transform and return entity
    return params.responseTransformer(updatedEntity);
  }
}
