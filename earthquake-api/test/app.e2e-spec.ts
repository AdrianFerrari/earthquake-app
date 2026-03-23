import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { of } from 'rxjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { EarthquakeResponseDto } from './../src/earthquakes/dto/earthquake-response.dto';

const makeFeature = (id: string, mag: number, alert: string | null = null) => ({
  type: 'Feature' as const,
  id,
  properties: {
    mag,
    place: `${id} Location`,
    time: 1700000000000,
    updated: 1700000001000,
    url: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
    detail: '',
    felt: null,
    cdi: null,
    mmi: null,
    alert,
    status: 'reviewed',
    tsunami: 0,
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
    title: `M ${mag} - ${id} Location`,
  },
  geometry: {
    type: 'Point' as const,
    coordinates: [-120.0, 37.0, 10.0] as [number, number, number],
  },
});

const makeUsgsResponse = (count = 3): EarthquakeResponseDto => ({
  type: 'FeatureCollection',
  metadata: {
    generated: Date.now(),
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
    title: 'USGS Earthquakes',
    status: 200,
    api: '1.14.0',
    count,
  },
  features: Array.from({ length: count }, (_, i) =>
    makeFeature(`eq${i + 1}`, 3.0 + i * 0.5, i === 0 ? 'green' : null),
  ),
});

describe('Earthquakes (e2e)', () => {
  let app: INestApplication<App>;
  let httpService: { get: jest.Mock };
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    cacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(httpService)
      .overrideProvider(CACHE_MANAGER)
      .useValue(cacheManager)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const mockAxiosResponse = (
    data: EarthquakeResponseDto,
  ): AxiosResponse<EarthquakeResponseDto> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  describe('GET /earthquakes', () => {
    it('should return 200 with earthquake list', async () => {
      httpService.get.mockReturnValue(
        of(mockAxiosResponse(makeUsgsResponse(3))),
      );

      const res = await request(app.getHttpServer()).get('/earthquakes');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('magnitude');
      expect(res.body[0]).toHaveProperty('place');
    });

    it('should accept valid query parameters', async () => {
      httpService.get.mockReturnValue(
        of(mockAxiosResponse(makeUsgsResponse(1))),
      );

      const res = await request(app.getHttpServer()).get('/earthquakes').query({
        minmagnitude: 5,
        maxmagnitude: 8,
        limit: 10,
        orderby: 'magnitude',
        starttime: '2024-01-01',
        endtime: '2024-01-31',
      });

      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid minmagnitude', async () => {
      const res = await request(app.getHttpServer())
        .get('/earthquakes')
        .query({ minmagnitude: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid orderby value', async () => {
      const res = await request(app.getHttpServer())
        .get('/earthquakes')
        .query({ orderby: 'invalid-order' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const res = await request(app.getHttpServer())
        .get('/earthquakes')
        .query({ limit: 9999 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /earthquakes/metrics', () => {
    it('should return 200 with metrics object', async () => {
      httpService.get.mockReturnValue(
        of(mockAxiosResponse(makeUsgsResponse(5))),
      );

      const res = await request(app.getHttpServer()).get(
        '/earthquakes/metrics',
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('averageMagnitude');
      expect(res.body).toHaveProperty('maxMagnitude');
      expect(res.body).toHaveProperty('minMagnitude');
      expect(res.body).toHaveProperty('byAlertLevel');
      expect(res.body).toHaveProperty('byMagnitudeRange');
      expect(res.body).toHaveProperty('tsunamiWarnings');
    });

    it('should return correct total count', async () => {
      httpService.get.mockReturnValue(
        of(mockAxiosResponse(makeUsgsResponse(5))),
      );

      const res = await request(app.getHttpServer()).get(
        '/earthquakes/metrics',
      );

      expect(res.body.total).toBe(5);
    });
  });
});
