import { Test } from '@nestjs/testing';
import { GetActiveSectionsMetadataUseCase } from '../get-active-sections-metadata.use-case';
import { setupMockDiscoverSectionRepository } from '../../../__mocks__/discover-section-repository.mock';
import {
  mockDiscoverSection,
  mockBusinessDiscoverSection,
  mockInactiveDiscoverSection,
} from '../../../__mocks__/discover-section.mocks';
import { DiscoverSectionRepository } from '../../../infrastructure/repositories/discover-section.repository';

// Define the interface for mocking
interface DiscoverSectionRepositoryInterface {
  findById: (id: number) => Promise<any>;
  findAll: () => Promise<any[]>;
  findBySlug: (slug: string) => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<void>;
}

describe('GetActiveSectionsMetadataUseCase', () => {
  let useCase: GetActiveSectionsMetadataUseCase;
  let discoverSectionRepository: DiscoverSectionRepositoryInterface;

  beforeEach(async () => {
    // Setup repository mock
    const mockRepo = setupMockDiscoverSectionRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetActiveSectionsMetadataUseCase,
        {
          provide: DiscoverSectionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = moduleRef.get<GetActiveSectionsMetadataUseCase>(
      GetActiveSectionsMetadataUseCase,
    );
    discoverSectionRepository = moduleRef.get(DiscoverSectionRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return only active sections metadata', async () => {
    // Mock findAll to return specific sections
    const findAllSpy = jest.spyOn(discoverSectionRepository, 'findAll');
    findAllSpy.mockResolvedValue([
      mockDiscoverSection, // active product section
      mockInactiveDiscoverSection, // inactive product section (should be filtered out)
      mockBusinessDiscoverSection, // active business section
    ]);

    const result = await useCase.execute();

    // Should contain 2 sections (active only)
    expect(result.sections.length).toBe(2);

    // First section should be product section
    expect(result.sections[0].id).toBe(mockDiscoverSection.id);
    expect(result.sections[0].title).toBe(mockDiscoverSection.title);
    expect(result.sections[0].slug).toBe(mockDiscoverSection.slug);
    expect(result.sections[0].type).toBe(mockDiscoverSection.type);

    // Second section should be business section
    expect(result.sections[1].id).toBe(mockBusinessDiscoverSection.id);
    expect(result.sections[1].title).toBe(mockBusinessDiscoverSection.title);
    expect(result.sections[1].slug).toBe(mockBusinessDiscoverSection.slug);
    expect(result.sections[1].type).toBe(mockBusinessDiscoverSection.type);

    // Verify repository was called
    expect(findAllSpy).toHaveBeenCalled();
  });

  it('should filter out inactive sections', async () => {
    // Mock findAll to return only inactive section
    const findAllSpy = jest.spyOn(discoverSectionRepository, 'findAll');
    findAllSpy.mockResolvedValue([
      mockInactiveDiscoverSection, // inactive (should be filtered out)
    ]);

    const result = await useCase.execute();

    // Should contain 0 sections (all were inactive)
    expect(result.sections.length).toBe(0);
  });

  it('should handle empty sections list', async () => {
    // Mock findAll to return empty array
    const findAllSpy = jest.spyOn(discoverSectionRepository, 'findAll');
    findAllSpy.mockResolvedValue([]);

    const result = await useCase.execute();

    // Should contain 0 sections
    expect(result.sections.length).toBe(0);
  });

  it('should return sections in priority order', async () => {
    // Create sections with different priorities
    const highPrioritySection = {
      ...mockDiscoverSection,
      id: 1,
      priority: 20,
    };

    const mediumPrioritySection = {
      ...mockBusinessDiscoverSection,
      id: 2,
      priority: 10,
    };

    const lowPrioritySection = {
      ...mockDiscoverSection,
      id: 3,
      priority: 5,
    };

    // Mock findAll to return sections in random order
    const findAllSpy = jest.spyOn(discoverSectionRepository, 'findAll');
    findAllSpy.mockResolvedValue([
      mediumPrioritySection,
      lowPrioritySection,
      highPrioritySection,
    ]);

    const result = await useCase.execute();

    // Should contain all 3 sections
    expect(result.sections.length).toBe(3);

    // Should be ordered by priority (descending)
    expect(result.sections[0].id).toBe(highPrioritySection.id);
    expect(result.sections[1].id).toBe(mediumPrioritySection.id);
    expect(result.sections[2].id).toBe(lowPrioritySection.id);
  });
});
