import { Test, TestingModule } from '@nestjs/testing';
import { DiscoverController } from '../discover.controller';
import { GetDiscoverContentUseCase } from '../../../application/use-cases/get-discover-content.use-case';
import { GetActiveSectionsMetadataUseCase } from '../../../application/use-cases/get-active-sections-metadata.use-case';
import {
  mockProductSectionContent,
  mockBusinessSectionContent,
} from '../../../__mocks__/discover-section.mocks';
import { LightDiscoverResponseDto } from '../../../application/dtos/light-response.dto';
import { SectionsMetadataResponseDto } from '../../../application/dtos/section-metadata.dto';
import { SectionType } from '../../../domain/entities/discover-section.entity';

describe('DiscoverController', () => {
  let controller: DiscoverController;
  let getDiscoverContentUseCase: GetDiscoverContentUseCase;
  let getActiveSectionsMetadataUseCase: GetActiveSectionsMetadataUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscoverController],
      providers: [
        {
          provide: GetDiscoverContentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetActiveSectionsMetadataUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiscoverController>(DiscoverController);
    getDiscoverContentUseCase = module.get<GetDiscoverContentUseCase>(
      GetDiscoverContentUseCase,
    );
    getActiveSectionsMetadataUseCase =
      module.get<GetActiveSectionsMetadataUseCase>(
        GetActiveSectionsMetadataUseCase,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDiscoverContent', () => {
    it('should return discover content with sections', async () => {
      const mockResponse: LightDiscoverResponseDto = {
        sections: [mockProductSectionContent, mockBusinessSectionContent],
      };

      const executeMethod = jest
        .spyOn(getDiscoverContentUseCase, 'execute')
        .mockImplementation(() => Promise.resolve(mockResponse));

      const result = await controller.getDiscoverContent();

      expect(executeMethod).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(result.sections.length).toBe(2);
    });

    it('should return empty array when no active sections', async () => {
      const mockResponse: LightDiscoverResponseDto = {
        sections: [],
      };

      const executeMethod = jest
        .spyOn(getDiscoverContentUseCase, 'execute')
        .mockImplementation(() => Promise.resolve(mockResponse));

      const result = await controller.getDiscoverContent();

      expect(executeMethod).toHaveBeenCalled();
      expect(result.sections).toEqual([]);
    });
  });

  describe('getActiveSections', () => {
    it('should return active sections metadata', async () => {
      const mockResponse: SectionsMetadataResponseDto = {
        sections: [
          {
            id: 1,
            title: 'Test Section',
            slug: 'test-section',
            type: SectionType.PRODUCTS,
          },
          {
            id: 3,
            title: 'Business Section',
            slug: 'business-section',
            type: SectionType.BUSINESSES,
          },
        ],
      };

      const executeMethod = jest
        .spyOn(getActiveSectionsMetadataUseCase, 'execute')
        .mockImplementation(() => Promise.resolve(mockResponse));

      const result = await controller.getActiveSections();

      expect(executeMethod).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(result.sections.length).toBe(2);
    });

    it('should return empty array when no active sections', async () => {
      const mockResponse: SectionsMetadataResponseDto = {
        sections: [],
      };

      const executeMethod = jest
        .spyOn(getActiveSectionsMetadataUseCase, 'execute')
        .mockImplementation(() => Promise.resolve(mockResponse));

      const result = await controller.getActiveSections();

      expect(executeMethod).toHaveBeenCalled();
      expect(result.sections).toEqual([]);
    });
  });
});
