import {
  mockDiscoverSection,
  mockInactiveDiscoverSection,
  mockBusinessDiscoverSection,
} from './discover-section.mocks';

/**
 * Mock repository for discover section tests
 */
export const mockDiscoverSectionRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

/**
 * Configure the mock repository with default implementations
 */
export const setupMockDiscoverSectionRepository = () => {
  // Return all sections by default
  mockDiscoverSectionRepository.findAll.mockResolvedValue([
    mockDiscoverSection,
    mockInactiveDiscoverSection,
    mockBusinessDiscoverSection,
  ]);

  // Return section by ID
  mockDiscoverSectionRepository.findById.mockImplementation((id: number) => {
    const sections = {
      1: mockDiscoverSection,
      2: mockInactiveDiscoverSection,
      3: mockBusinessDiscoverSection,
    };
    return Promise.resolve(sections[id] || null);
  });

  // Return section by slug
  mockDiscoverSectionRepository.findBySlug.mockImplementation(
    (slug: string) => {
      const slugMap = {
        'test-section': mockDiscoverSection,
        'inactive-section': mockInactiveDiscoverSection,
        'business-section': mockBusinessDiscoverSection,
      };
      return Promise.resolve(slugMap[slug] || null);
    },
  );

  // Create section
  mockDiscoverSectionRepository.create.mockImplementation((data) => {
    return Promise.resolve({
      ...data,
      id: 999, // New ID
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Update section
  mockDiscoverSectionRepository.update.mockImplementation((id, data) => {
    const section = {
      1: mockDiscoverSection,
      2: mockInactiveDiscoverSection,
      3: mockBusinessDiscoverSection,
    }[id];

    if (!section) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      ...section,
      ...data,
      updatedAt: new Date(),
    });
  });

  // Delete section
  mockDiscoverSectionRepository.delete.mockResolvedValue(undefined);

  return mockDiscoverSectionRepository;
};
