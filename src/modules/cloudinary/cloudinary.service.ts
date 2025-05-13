import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
  AdminAndResourceOptions,
} from 'cloudinary';
import { env } from '../../config/env.config';
import { Readable } from 'stream';

// Simple in-memory cache for frequently accessed images
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// Define more specific return types
interface CloudinaryResourcesResponse {
  resources: unknown[];
  next_cursor?: string;
  rate_limit_allowed?: number;
  rate_limit_reset_at?: string;
  rate_limit_remaining?: number;
}

interface CloudinaryFolderResponse {
  success: boolean;
  path: string;
  name: string;
}

// Type for transformations
type TransformationOption =
  | string
  | Array<Record<string, string | number | boolean>>;

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

  onModuleInit() {
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
   * Upload a file stream to Cloudinary
   * @param fileStream Readable stream of the file
   * @param options Upload options
   * @returns Promise with upload results
   */
  async uploadStream(
    fileStream: Readable,
    options: UploadApiOptions = { resource_type: 'auto' },
  ): Promise<UploadApiResponse> {
    try {
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              reject(new Error(error.message || 'Error uploading stream'));
            } else {
              resolve(result as UploadApiResponse);
            }
          },
        );
        fileStream.pipe(uploadStream);
      });
    } catch (error) {
      throw new Error(
        `Error uploading stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as UploadApiResponse;

      this.clearCacheEntriesForPublicId(publicId);

      return result;
    } catch (error) {
      throw new Error(
        `Error deleting image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a transformed URL for a Cloudinary resource
   * @param publicId The public ID of the resource
   * @param transformations String of transformation parameters or array of transformation objects
   * @returns URL with the specified transformations
   */
  getTransformedUrl(
    publicId: string,
    transformations: TransformationOption,
  ): string {
    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });
  }

  /**
   * List resources in a specific folder
   * @param folder The folder path to list resources from
   * @param options Additional options for the API call
   * @returns Promise with the resources list
   */
  async listResources(
    folder: string,
    options: AdminAndResourceOptions = {},
  ): Promise<CloudinaryResourcesResponse> {
    const cacheKey = `resources_${folder}_${JSON.stringify(options)}`;
    const cachedResult = this.getFromCache(cacheKey);

    if (cachedResult) {
      return cachedResult as CloudinaryResourcesResponse;
    }

    try {
      const result = (await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        ...options,
      })) as CloudinaryResourcesResponse;

      this.addToCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(
        `Error listing resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate signed params for client-side uploads using an upload preset
   * @param uploadPreset The upload preset name
   * @returns Object with signature and other params for client-side upload
   */
  getSignedUploadParams(uploadPreset: string): Record<string, string | number> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        upload_preset: uploadPreset,
      },
      env.CLOUDINARY_API_SECRET || '',
    );

    return {
      cloud_name: env.CLOUDINARY_CLOUD_NAME || '',
      api_key: env.CLOUDINARY_API_KEY || '',
      timestamp,
      signature,
      upload_preset: uploadPreset,
    };
  }

  /**
   * Create a new folder in Cloudinary
   * @param folderPath Path of the folder to create
   * @returns Promise with the folder creation result
   */
  async createFolder(folderPath: string): Promise<CloudinaryFolderResponse> {
    try {
      return (await cloudinary.api.create_folder(
        folderPath,
      )) as CloudinaryFolderResponse;
    } catch (error) {
      throw new Error(
        `Error creating folder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private addToCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private getFromCache(key: string): unknown {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private clearCacheEntriesForPublicId(publicId: string): void {
    // Remove cache entries that reference the specified public ID
    this.cache.forEach((_, key) => {
      if (key.includes(publicId)) {
        this.cache.delete(key);
      }
    });
  }
}
