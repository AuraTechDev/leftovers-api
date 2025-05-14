import { Injectable } from '@nestjs/common';
import { DiscoverSectionRepository } from '../../infrastructure/repositories/discover-section.repository';
import { BusinessRepository } from '../../../business/infrastructure/repositories/business.repository';
import { ProductsRepository } from '../../../products/infrastructure/repositories/products.repository';
import {
  DiscoverSection,
  SectionType,
} from '../../domain/entities/discover-section.entity';
import {
  LightDiscoverResponseDto,
  LightSectionDto,
  LightProductDto,
  LightBusinessDto,
} from '../dtos/light-response.dto';

@Injectable()
export class GetDiscoverContentUseCase {
  constructor(
    private readonly discoverSectionRepository: DiscoverSectionRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  /**
   * Fetches all active discover sections with their content based on queryConfig
   * Applies standard product and business validations:
   * - Products must not be disabled
   * - Products must have quantity > 0
   * - Content is filtered according to each section's queryConfig
   */
  async execute(): Promise<LightDiscoverResponseDto> {
    // Get all active sections ordered by priority
    const sections = await this.discoverSectionRepository.findAll();
    const activeSections = sections.filter((section) => section.isActive);

    // Process each section to get its content
    const sectionContents = await Promise.all(
      activeSections.map(async (section) => {
        const content = await this.getSectionContent(section);
        return content;
      }),
    );

    return {
      sections: sectionContents,
    };
  }

  private async getSectionContent(
    section: DiscoverSection,
  ): Promise<LightSectionDto> {
    let items: any[] = [];

    switch (section.type) {
      case SectionType.PRODUCTS:
        items = await this.getProductsForSection(section);
        break;
      case SectionType.BUSINESSES:
        items = await this.getBusinessesForSection(section);
        break;
    }

    return {
      id: section.id,
      title: section.title,
      slug: section.slug,
      type: section.type,
      items,
    };
  }

  private async getProductsForSection(
    section: DiscoverSection,
  ): Promise<LightProductDto[]> {
    const config = section.queryConfig || {};
    let products = await this.productsRepository.findAll();

    // Filter out disabled products and products with no quantity
    products = products.filter(
      (product) => !product.isDisabled && product.quantity > 0,
    );

    // Apply filters based on queryConfig
    if (config.closeToExpiry) {
      // Find products that are close to expiry (e.g., based on some "expiryDate" field)
      products = products.filter(() => {
        // Logic to check if product is close to expiry
        return true; // Placeholder - implement actual logic
      });
    }

    if (config.availableToday) {
      // Find products available for same-day pickup
      products = products.filter(() => {
        // Logic to check if product is available for same-day pickup
        return true; // Placeholder - implement actual logic
      });
    }

    if (config.productType) {
      // Filter by product type/food type
      products = products.filter((product) => {
        return product.foodTypeId === config.productType;
      });
    }

    if (config.maxItems && typeof config.maxItems === 'number') {
      // Limit number of products returned
      products = products.slice(0, config.maxItems);
    }

    // Get business names for all products
    const businessIds = [
      ...new Set(products.map((product) => product.businessId)),
    ];
    const businesses = await this.businessRepository.findAll();
    const businessMap = new Map(
      businesses
        .filter((b) => businessIds.includes(b.id))
        .map((b) => [b.id, b] as [number, typeof b]),
    );

    // Map to lightweight DTOs for mobile
    return products.map((product) => {
      const business = businessMap.get(product.businessId);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        businessId: product.businessId,
        businessName: business?.name,
        quantity: product.quantity,
      };
    });
  }

  private async getBusinessesForSection(
    section: DiscoverSection,
  ): Promise<LightBusinessDto[]> {
    const config = section.queryConfig || {};
    let businesses = await this.businessRepository.findAll();

    // Note: If businesses get an isDisabled field in the future, add filtering here
    // businesses = businesses.filter(business => !business.isDisabled);

    // Apply filters based on queryConfig
    if (config.distance && typeof config.distance === 'number') {
      // Filter businesses within a certain distance
      // This would require calculating distance from user's location
      // For now, we'll just return all businesses
    }

    if (config.businessType) {
      // Filter by business type - this is a placeholder
      // Actual implementation would depend on how business types are stored
    }

    if (config.maxItems && typeof config.maxItems === 'number') {
      // Limit number of businesses returned
      businesses = businesses.slice(0, config.maxItems);
    }

    // Map to lightweight DTOs for mobile
    return businesses.map((business) => {
      return {
        id: business.id,
        name: business.name,
        address: business.address,
        logoUrl: business.logoUrl,
        bannerUrl: business.bannerUrl,
      };
    });
  }
}
