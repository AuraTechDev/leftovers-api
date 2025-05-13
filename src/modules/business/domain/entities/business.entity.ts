export class Business {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  phone?: string | null;
  logoUrl?: string | null;
  openingHours?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
