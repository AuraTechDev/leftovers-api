export class Business {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  phone?: string;
  logoUrl?: string;
  openingHours?: string; // New field for business hours
  createdAt: Date;
  updatedAt: Date;
}
