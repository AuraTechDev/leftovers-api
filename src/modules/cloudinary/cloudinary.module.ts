import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryImageService } from './cloudinary-image.service';

@Module({
  providers: [CloudinaryService, CloudinaryImageService],
  exports: [CloudinaryService, CloudinaryImageService],
})
export class CloudinaryModule {}
