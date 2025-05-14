import { AuthUser } from '../../auth/domain/interfaces/user.interface';
import { UploadedFileType } from '../../cloudinary/interfaces/file-upload.interface';

/**
 * Interface for request objects that contain user information
 */
export interface RequestWithUser extends Request {
  user: AuthUser;
}

// Re-export the interface for test use
export { UploadedFileType };
