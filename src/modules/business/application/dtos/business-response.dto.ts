import { Business } from '../../domain/entities/business.entity';

export class BusinessResponseDto {
  id: number;
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

  static fromEntity(business: Business): BusinessResponseDto {
    const response = new BusinessResponseDto();
    response.id = business.id;
    response.name = business.name;
    response.description = business.description;
    response.address = business.address;
    response.latitude = business.latitude;
    response.longitude = business.longitude;
    response.contactEmail = business.contactEmail;
    response.phone = business.phone;
    response.logoUrl = business.logoUrl;
    response.openingHours = business.openingHours;
    response.createdAt = business.createdAt;
    response.updatedAt = business.updatedAt;
    return response;
  }
}
