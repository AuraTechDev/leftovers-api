import { User } from '../../../users/domain/entities/user.entity';

export class RefreshToken {
  token: string;
  userId: number;
  expiresAt: Date;
  user: User;

  constructor(data: Partial<RefreshToken>) {
    Object.assign(this, data);
  }
}
