import { IsNotEmpty } from 'class-validator';

/**
 * DTO for business banner upload requests
 * The file validation is handled by FileInterceptor in the controller
 */
export class UploadBannerDto {
  @IsNotEmpty()
  file: any;
}
