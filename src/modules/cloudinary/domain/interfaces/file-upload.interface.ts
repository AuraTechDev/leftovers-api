/**
 * Interface for file uploads across the application
 * This follows the Express/Multer file upload interface structure
 */
export interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}
