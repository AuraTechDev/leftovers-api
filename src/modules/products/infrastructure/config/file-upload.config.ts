import { BadRequestException } from '@nestjs/common';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

export const imageUploadOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req: any, file: MulterFile, callback: FileFilterCallback) => {
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
