import { Module } from '@nestjs/common';
import { CloudinaryService } from './infrastructure/services/cloudinary.service';
import { CloudinaryImageService } from './infrastructure/services/cloudinary-image.service';

@Module({
  providers: [CloudinaryService, CloudinaryImageService],
  exports: [CloudinaryService, CloudinaryImageService],
})
export class CloudinaryModule {}
