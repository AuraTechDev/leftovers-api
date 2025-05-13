import { AuthUser } from '../../auth/domain/interfaces/user.interface';

/**
 * Interface for request objects that contain user information
 */
export interface RequestWithUser extends Request {
  user: AuthUser;
}

/**
 * Interface for file uploads in tests
 */
export interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
