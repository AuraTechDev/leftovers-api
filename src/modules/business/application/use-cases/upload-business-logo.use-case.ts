import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { BusinessResponseDto } from '../dtos/business-response.dto';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';

@Injectable()
export class UploadBusinessLogoUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(id: number, file: Buffer): Promise<BusinessResponseDto> {
    const business = await this.businessRepository.findById(id);

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    let oldLogoPublicId: string | null = null;

    if (business.logoUrl) {
      try {
        // Extract the public ID from the URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
        const match = business.logoUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        if (match && match[1]) {
          oldLogoPublicId = match[1];
        }
      } catch (error) {
        console.error('Error parsing old logo URL:', error);
      }
    }

    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDERS.BUSINESS_LOGOS,
    );

    const updatedBusiness = {
      ...business,
      logoUrl: uploadResult.secure_url,
    };

    const result = await this.businessRepository.update(id, updatedBusiness);

    // Delete the old logo if it exists
    if (oldLogoPublicId) {
      try {
        await this.cloudinaryService.deleteImage(oldLogoPublicId);
      } catch (error) {
        console.error('Error deleting old logo:', error);
        console.error('Failed to delete public ID:', oldLogoPublicId);
      }
    }

    // Return the updated business
    return BusinessResponseDto.fromEntity(result);
  }
}
