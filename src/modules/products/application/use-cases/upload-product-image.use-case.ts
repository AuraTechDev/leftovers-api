import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(id: number, imageBuffer: Buffer): Promise<ProductResponseDto> {
    const existingProduct = await this.productsRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let oldProductImage: string | null = null;

    if (existingProduct.imageUrl) {
      try {
        const match = existingProduct.imageUrl.match(
          /\/upload\/(?:v\d+\/)?(.+)\.\w+$/,
        );

        if (match && match[1]) {
          oldProductImage = match[1];
        }
      } catch (error) {
        console.error('Error parsing old product image URL:', error);
      }
    }

    const uploadResult = await this.cloudinaryService.uploadImage(
      imageBuffer,
      CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
    );

    const updatedProduct = await this.productsRepository.update(id, {
      imageUrl: uploadResult.secure_url,
    });

    if (oldProductImage) {
      try {
        await this.cloudinaryService.deleteImage(oldProductImage);
      } catch (error) {
        console.error('Error deleting old product image:', error);
        console.error('Failed to delete public ID:', oldProductImage);
      }
    }

    return ProductResponseDto.fromEntity(updatedProduct);
  }
}
