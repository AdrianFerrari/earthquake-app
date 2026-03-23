import { Test, TestingModule } from '@nestjs/testing';
import { EarthquakeQueryDto } from './dto/earthquake-query.dto';
import { EarthquakeSummary } from './dto/earthquake-response.dto';
import { EarthquakesController } from './earthquakes.controller';
import { EarthquakesService } from './earthquakes.service';

const mockSummary = (id: string, magnitude: number): EarthquakeSummary => ({
  id,
  magnitude,
  place: 'Test Location',
  time: 1700000000000,
  alert: null,
  tsunami: 0,
  coordinates: [-120.0, 37.0, 10.0],
  url: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
  title: `M ${magnitude} - Test Location`,
  magType: 'ml',
  sig: 100,
});

describe('EarthquakesController', () => {
  let controller: EarthquakesController;
  let service: jest.Mocked<EarthquakesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EarthquakesController],
      providers: [
        {
          provide: EarthquakesService,
          useValue: {
            findAll: jest.fn(),
            getMetrics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EarthquakesController>(EarthquakesController);
    service = module.get(EarthquakesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return an array of earthquake summaries', async () => {
      const summaries = [mockSummary('eq1', 4.5), mockSummary('eq2', 3.2)];
      service.findAll.mockResolvedValue(summaries);

      const result = await controller.findAll({});

      expect(result).toEqual(summaries);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should pass query parameters to the service', async () => {
      const query: EarthquakeQueryDto = {
        minmagnitude: 5.0,
        limit: 25,
        orderby: 'magnitude',
      };
      service.findAll.mockResolvedValue([]);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no earthquakes found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('getMetrics', () => {
    it('should return earthquake metrics', async () => {
      const metrics = {
        total: 100,
        averageMagnitude: 3.5,
        maxMagnitude: 7.2,
        minMagnitude: 1.1,
        byAlertLevel: { none: 90, green: 8, yellow: 2 },
        byMagnitudeRange: {
          'micro (<2.0)': 10,
          'minor (2.0-3.9)': 50,
          'light (4.0-4.9)': 25,
          'moderate (5.0-5.9)': 10,
          'strong (6.0-6.9)': 4,
          'major (7.0+)': 1,
        },
        tsunamiWarnings: 0,
      };
      service.getMetrics.mockResolvedValue(metrics);

      const result = await controller.getMetrics({});

      expect(result).toEqual(metrics);
      expect(service.getMetrics).toHaveBeenCalledWith({});
    });
  });
});
