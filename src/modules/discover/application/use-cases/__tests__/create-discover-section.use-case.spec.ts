import { Test } from '@nestjs/testing';
import { CreateDiscoverSectionUseCase } from '../create-discover-section.use-case';
import { setupMockDiscoverSectionRepository } from '../../../__mocks__/discover-section-repository.mock';
import { mockDiscoverSection } from '../../../__mocks__/discover-section.mocks';
import { CreateDiscoverSectionDto } from '../../dtos/create-discover-section.dto';
import { SectionType } from '../../../domain/entities/discover-section.entity';
import { ConflictException } from '@nestjs/common';
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

describe('CreateDiscoverSectionUseCase', () => {
  let useCase: CreateDiscoverSectionUseCase;
  let discoverSectionRepository: DiscoverSectionRepositoryInterface;

  beforeEach(async () => {
    // Setup repository mock
    const mockRepo = setupMockDiscoverSectionRepository();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateDiscoverSectionUseCase,
        {
          provide: DiscoverSectionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = moduleRef.get<CreateDiscoverSectionUseCase>(
      CreateDiscoverSectionUseCase,
    );
    discoverSectionRepository = moduleRef.get(DiscoverSectionRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a new discover section', async () => {
    const createDto: CreateDiscoverSectionDto = {
      title: 'Test Section',
      slug: 'new-test-section',
      type: SectionType.PRODUCTS,
      queryConfig: { maxItems: 5 },
      isActive: true,
      priority: 10,
    };

    // Mock findBySlug to return null (indicating no existing section with this slug)
    const findBySlugSpy = jest.spyOn(discoverSectionRepository, 'findBySlug');
    findBySlugSpy.mockResolvedValue(null);

    // Mock create method
    const createSpy = jest.spyOn(discoverSectionRepository, 'create');
    createSpy.mockResolvedValue({
      ...createDto,
      id: 999,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true, // Ensure isActive is not undefined
    });

    const result = await useCase.execute(createDto);

    // Verify the result has all expected properties
    expect(result.id).toBe(999);
    expect(result.title).toBe(createDto.title);
    expect(result.slug).toBe(createDto.slug);
    expect(result.type).toBe(createDto.type);
    expect(result.queryConfig).toEqual(createDto.queryConfig);
    expect(result.isActive).toBe(createDto.isActive);
    expect(result.priority).toBe(createDto.priority);

    // Verify repository methods were called
    expect(findBySlugSpy).toHaveBeenCalledWith(createDto.slug);
    expect(createSpy).toHaveBeenCalledWith(createDto);
  });

  it('should throw ConflictException when section with same slug already exists', async () => {
    const createDto: CreateDiscoverSectionDto = {
      title: 'Test Section',
      slug: 'test-section', // Existing slug
      type: SectionType.PRODUCTS,
      queryConfig: { maxItems: 5 },
      isActive: true,
      priority: 10,
    };

    // Mock findBySlug to return an existing section
    const findBySlugSpy = jest.spyOn(discoverSectionRepository, 'findBySlug');
    findBySlugSpy.mockResolvedValue(mockDiscoverSection);

    const createSpy = jest.spyOn(discoverSectionRepository, 'create');

    // Expect the execute method to throw ConflictException
    await expect(useCase.execute(createDto)).rejects.toThrow(ConflictException);

    // Verify findBySlug was called but create was not
    expect(findBySlugSpy).toHaveBeenCalledWith(createDto.slug);
    expect(createSpy).not.toHaveBeenCalled();
  });
});
