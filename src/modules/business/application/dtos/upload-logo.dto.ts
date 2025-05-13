/**
 * Data transfer object for handling business logo uploads
 */
export class UploadLogoDto {
  /**
   * The uploaded file from multipart/form-data
   */
  file: any; // File will be handled by NestJS FileInterceptor
}
