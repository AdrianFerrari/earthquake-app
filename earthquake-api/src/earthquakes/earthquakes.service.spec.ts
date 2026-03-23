import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { EarthquakeQueryDto } from './dto/earthquake-query.dto';
import { EarthquakeResponseDto } from './dto/earthquake-response.dto';
import { EarthquakesService } from './earthquakes.service';

const mockFeature = (
  id: string,
  mag: number | null,
  alert: string | null = null,
  tsunami = 0,
) => ({
  type: 'Feature' as const,
  id,
  properties: {
    mag,
    place: 'Test Location',
    time: 1700000000000,
    updated: 1700000001000,
    url: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
    detail: '',
    felt: null,
    cdi: null,
    mmi: null,
    alert,
    status: 'reviewed',
    tsunami,
    sig: 100,
    net: 'us',
    code: id,
    ids: `,${id},`,
    sources: ',us,',
    types: ',dyfi,',
    nst: null,
    dmin: null,
    rms: null,
    gap: null,
    magType: 'ml',
    type: 'earthquake',
    title: `M ${mag} - Test Location`,
  },
  geometry: {
    type: 'Point' as const,
    coordinates: [-120.0, 37.0, 10.0] as [number, number, number],
  },
});

const mockUsgsResponse = (
  features: ReturnType<typeof mockFeature>[],
): EarthquakeResponseDto => ({
  type: 'FeatureCollection',
  metadata: {
    generated: Date.now(),
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
    title: 'USGS Earthquakes',
    status: 200,
    api: '1.14.0',
    count: features.length,
  },
  features,
});

describe('EarthquakesService', () => {
  let service: EarthquakesService;
  let httpService: jest.Mocked<HttpService>;
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  const mockConfigService = {
    get: jest
      .fn()
      .mockReturnValue('https://earthquake.usgs.gov/fdsnws/event/1'),
  };

  beforeEach(async () => {
    cacheManager = { get: jest.fn(), set: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EarthquakesService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<EarthquakesService>(EarthquakesService);
    httpService = module.get(HttpService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return cached data when available', async () => {
      const cached = [{ id: 'eq1', magnitude: 4.5 }];
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.findAll({});

      expect(result).toEqual(cached);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from USGS when cache miss', async () => {
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const features = [mockFeature('eq1', 4.5), mockFeature('eq2', 3.2)];
      const axiosResponse: AxiosResponse<EarthquakeResponseDto> = {
        data: mockUsgsResponse(features),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.findAll({});

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('eq1');
      expect(result[0].magnitude).toBe(4.5);
      expect(cacheManager.set).toHaveBeenCalledTimes(1);
    });

    it('should map earthquake features to summaries correctly', async () => {
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const features = [mockFeature('eq1', 5.1, 'green', 0)];
      const axiosResponse: AxiosResponse<EarthquakeResponseDto> = {
        data: mockUsgsResponse(features),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.findAll({});

      expect(result[0]).toMatchObject({
        id: 'eq1',
        magnitude: 5.1,
        alert: 'green',
        tsunami: 0,
        place: 'Test Location',
      });
    });

    it('should throw InternalServerErrorException on USGS API failure', async () => {
      cacheManager.get.mockResolvedValue(null);
      (httpService.get as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.findAll({})).rejects.toThrow(
        'Failed to fetch earthquake data from USGS',
      );
    });

    it('should apply query filters to USGS request params', async () => {
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const axiosResponse: AxiosResponse<EarthquakeResponseDto> = {
        data: mockUsgsResponse([]),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(axiosResponse));

      const query: EarthquakeQueryDto = {
        minmagnitude: 5.0,
        maxmagnitude: 8.0,
        limit: 50,
        orderby: 'magnitude',
        starttime: '2024-01-01',
        endtime: '2024-01-31',
      };

      await service.findAll(query);

      const callArgs = (httpService.get as jest.Mock).mock.calls[0];
      expect(callArgs[1].params).toMatchObject({
        minmagnitude: 5.0,
        maxmagnitude: 8.0,
        limit: 50,
        orderby: 'magnitude',
        starttime: '2024-01-01',
        endtime: '2024-01-31',
      });
    });
  });

  describe('getMetrics', () => {
    it('should return cached metrics when available', async () => {
      const cached = { total: 10, averageMagnitude: 4.2 };
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.getMetrics({});

      expect(result).toEqual(cached);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should compute correct metrics from earthquake data', async () => {
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const features = [
        mockFeature('eq1', 3.5, 'green', 0),
        mockFeature('eq2', 5.2, 'yellow', 1),
        mockFeature('eq3', 7.1, 'orange', 0),
        mockFeature('eq4', null, null, 0),
      ];
      const axiosResponse: AxiosResponse<EarthquakeResponseDto> = {
        data: mockUsgsResponse(features),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.getMetrics({});

      expect(result.total).toBe(4);
      expect(result.maxMagnitude).toBe(7.1);
      expect(result.minMagnitude).toBe(3.5);
      expect(result.tsunamiWarnings).toBe(1);
      expect(result.byAlertLevel['green']).toBe(1);
      expect(result.byAlertLevel['yellow']).toBe(1);
      expect(result.byAlertLevel['orange']).toBe(1);
      expect(result.byAlertLevel['none']).toBe(1);
    });

    it('should correctly categorize earthquakes by magnitude range', async () => {
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const features = [
        mockFeature('eq1', 1.0),
        mockFeature('eq2', 2.5),
        mockFeature('eq3', 4.5),
        mockFeature('eq4', 5.5),
        mockFeature('eq5', 6.5),
        mockFeature('eq6', 7.5),
      ];
      const axiosResponse: AxiosResponse<EarthquakeResponseDto> = {
        data: mockUsgsResponse(features),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.getMetrics({});

      expect(result.byMagnitudeRange['micro (<2.0)']).toBe(1);
      expect(result.byMagnitudeRange['minor (2.0-3.9)']).toBe(1);
      expect(result.byMagnitudeRange['light (4.0-4.9)']).toBe(1);
      expect(result.byMagnitudeRange['moderate (5.0-5.9)']).toBe(1);
      expect(result.byMagnitudeRange['strong (6.0-6.9)']).toBe(1);
      expect(result.byMagnitudeRange['major (7.0+)']).toBe(1);
    });

    it('should return zero metrics for empty dataset', async () => {
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const axiosResponse: AxiosResponse<EarthquakeResponseDto> = {
        data: mockUsgsResponse([]),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.getMetrics({});

      expect(result.total).toBe(0);
      expect(result.averageMagnitude).toBe(0);
      expect(result.maxMagnitude).toBe(0);
      expect(result.minMagnitude).toBe(0);
      expect(result.tsunamiWarnings).toBe(0);
    });
  });
});
