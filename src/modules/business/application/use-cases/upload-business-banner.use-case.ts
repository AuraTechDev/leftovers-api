import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { CloudinaryImageService } from '../../../cloudinary/cloudinary-image.service';
import { BusinessResponseDto } from '../dtos/business-response.dto';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';
import { Business } from '../../domain/entities/business.entity';

@Injectable()
export class UploadBusinessBannerUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly cloudinaryImageService: CloudinaryImageService,
  ) {}

  async execute(id: number, file: Buffer): Promise<BusinessResponseDto> {
    try {
      return await this.cloudinaryImageService.uploadEntityImage({
        entityId: id,
        repository: this.businessRepository,
        imageBuffer: file,
        cloudinaryFolder: CLOUDINARY_FOLDERS.BUSINESS_BANNERS,
        imageField: 'bannerUrl',
        responseTransformer: (entity: Business) =>
          BusinessResponseDto.fromEntity(entity),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }
      throw error;
    }
  }
}
