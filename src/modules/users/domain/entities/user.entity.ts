export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  businessId?: string | null; // ID of the business it is associated with (for users with the BUSINESS role)
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
