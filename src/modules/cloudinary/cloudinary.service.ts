import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import { env } from '../../config/env.config';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  onModuleInit() {
    // Configure Cloudinary with environment variables credentials
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  /**
   * Upload an image to Cloudinary
   * @param file The file to upload (Buffer or path string)
   * @param folder Optional folder to store the image
   * @returns Promise with upload results
   */
  async uploadImage(
    file: Buffer | string,
    folder?: string,
  ): Promise<UploadApiResponse> {
    const uploadOptions: UploadApiOptions = {
      resource_type: 'auto',
      ...(folder && { folder }),
    };

    try {
      if (Buffer.isBuffer(file)) {
        return await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                reject(new Error(error.message || 'Error uploading file'));
              } else {
                resolve(result as UploadApiResponse);
              }
            },
          );
          uploadStream.end(file);
        });
      } else {
        return await cloudinary.uploader.upload(file, uploadOptions);
      }
    } catch (error) {
      throw new Error(
        `Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId Public ID of the image to delete
   * @returns Promise with deletion result
   */
  async deleteImage(publicId: string): Promise<UploadApiResponse> {
    try {
      return (await cloudinary.uploader.destroy(publicId)) as UploadApiResponse;
    } catch (error) {
      throw new Error(
        `Error deleting image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
