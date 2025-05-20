import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { CloudinaryImageService } from '../../../cloudinary/infrastructure/services/cloudinary-image.service';
import { BusinessResponseDto } from '../dtos/business-response.dto';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';
import { Business } from '../../domain/entities/business.entity';
import { BusinessAuthorizationService } from '../services/business-authorization.service';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';

@Injectable()
export class UploadBusinessLogoUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly cloudinaryImageService: CloudinaryImageService,
    private readonly businessAuthorizationService: BusinessAuthorizationService,
  ) {}

  async execute(
    id: number,
    file: Buffer,
    currentUser: AuthUser,
  ): Promise<BusinessResponseDto> {
    await this.businessAuthorizationService.verifyBusinessAccess(
      currentUser,
      id,
      'update the logo of',
    );

    try {
      return await this.cloudinaryImageService.uploadEntityImage({
        entityId: id,
        repository: this.businessRepository,
        imageBuffer: file,
        cloudinaryFolder: CLOUDINARY_FOLDERS.BUSINESS_LOGOS,
        imageField: 'logoUrl',
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
