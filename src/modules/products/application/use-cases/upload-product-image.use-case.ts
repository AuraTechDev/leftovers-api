import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryImageService } from '../../../cloudinary/cloudinary-image.service';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cloudinaryImageService: CloudinaryImageService,
  ) {}

  async execute(id: number, imageBuffer: Buffer): Promise<ProductResponseDto> {
    try {
      return await this.cloudinaryImageService.uploadEntityImage({
        entityId: id,
        repository: this.productsRepository,
        imageBuffer,
        cloudinaryFolder: CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
        imageField: 'imageUrl',
        responseTransformer: (entity: Product) =>
          ProductResponseDto.fromEntity(entity),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }
}
