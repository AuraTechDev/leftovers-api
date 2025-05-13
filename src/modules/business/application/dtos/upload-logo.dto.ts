import { IsNotEmpty } from 'class-validator';

/**
 * DTO for business logo upload requests
 * The file validation is handled by FileInterceptor in the controller
 */
export class UploadLogoDto {
  @IsNotEmpty()
  file: any;
}
