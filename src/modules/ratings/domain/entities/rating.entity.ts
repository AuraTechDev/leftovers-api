import { User } from '../../../users/domain/entities/user.entity';
import { Product } from '../../../products/domain/entities/product.entity';
import { Business } from '../../../business/domain/entities/business.entity';

export class Rating {
  id: number;
  userId: number;
  user?: User;
  productId: number;
  product?: Product;
  businessId: number;
  business?: Business;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}
