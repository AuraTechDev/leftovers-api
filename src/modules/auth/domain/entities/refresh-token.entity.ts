import { User } from '../../../users/domain/entities/user.entity';

export class RefreshToken {
  token: string;
  userId: number;
  user?: User;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<RefreshToken>) {
    Object.assign(this, data);
  }
}
