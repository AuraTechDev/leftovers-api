import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(id: number, imageBuffer: Buffer): Promise<ProductResponseDto> {
    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Upload image to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(
      imageBuffer,
      `product-${id}`,
    );

    // Update product with new image URL
    const updatedProduct = await this.productsRepository.update(id, {
      imageUrl: uploadResult.secure_url,
    });

    return ProductResponseDto.fromEntity(updatedProduct);
  }
}
