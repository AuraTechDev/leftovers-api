import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { UploadedFileType } from '../domain/interfaces/file-upload.interface';

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

/**
 * Common configuration options for image uploads across the application
 * This can be used by any module that needs to handle image uploads
 */
export const imageUploadOptions: MulterOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (
    _req: any,
    file: UploadedFileType,
    callback: FileFilterCallback,
  ) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(
        new BadRequestException(
          'Only image files (jpg, jpeg, png, gif) are allowed',
        ),
        false,
      );
    }
    callback(null, true);
  },
};
