import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EarthquakeMetrics, EarthquakeSummary } from '../models/earthquake.model';
import { EarthquakeService } from './earthquake.service';

const mockSummary = (id: string, magnitude: number): EarthquakeSummary => ({
  id,
  magnitude,
  place: `${id} location`,
  time: 1700000000000,
  alert: null,
  tsunami: 0,
  coordinates: [-120.0, 37.0, 10.0],
  url: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
  title: `M ${magnitude} - ${id} location`,
  magType: 'ml',
  sig: 100,
});

const mockMetrics = (): EarthquakeMetrics => ({
  total: 50,
  averageMagnitude: 3.4,
  maxMagnitude: 6.2,
  minMagnitude: 1.1,
  byAlertLevel: { none: 45, green: 4, yellow: 1 },
  byMagnitudeRange: {
    'micro (<2.0)': 10,
    'minor (2.0-3.9)': 25,
    'light (4.0-4.9)': 10,
    'moderate (5.0-5.9)': 4,
    'strong (6.0-6.9)': 1,
    'major (7.0+)': 0,
  },
  tsunamiWarnings: 0,
});

describe('EarthquakeService', () => {
  let service: EarthquakeService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EarthquakeService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EarthquakeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getEarthquakes', () => {
    it('should call GET /earthquakes with no params by default', () => {
      const data = [mockSummary('eq1', 4.5)];

      service.getEarthquakes().subscribe((result) => {
        expect(result).toEqual(data);
      });

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/earthquakes`);
      expect(req.request.method).toBe('GET');
      req.flush(data);
    });

    it('should pass minmagnitude query param', () => {
      service.getEarthquakes({ minmagnitude: 5.0 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/earthquakes`);
      expect(req.request.params.get('minmagnitude')).toBe('5');
      req.flush([]);
    });

    it('should pass all query params when provided', () => {
      service
        .getEarthquakes({
          starttime: '2024-01-01',
          endtime: '2024-01-31',
          minmagnitude: 4,
          maxmagnitude: 8,
          orderby: 'magnitude',
          limit: 50,
        })
        .subscribe();

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/earthquakes`);
      const params = req.request.params;
      expect(params.get('starttime')).toBe('2024-01-01');
      expect(params.get('endtime')).toBe('2024-01-31');
      expect(params.get('minmagnitude')).toBe('4');
      expect(params.get('maxmagnitude')).toBe('8');
      expect(params.get('orderby')).toBe('magnitude');
      expect(params.get('limit')).toBe('50');
      req.flush([]);
    });

    it('should not include undefined params', () => {
      service.getEarthquakes({ minmagnitude: 5 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/earthquakes`);
      expect(req.request.params.has('starttime')).toBe(false);
      expect(req.request.params.has('endtime')).toBe(false);
      req.flush([]);
    });

    it('should return empty array when no earthquakes found', () => {
      service.getEarthquakes().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/earthquakes`);
      req.flush([]);
    });
  });

  describe('getMetrics', () => {
    it('should call GET /earthquakes/metrics', () => {
      const metrics = mockMetrics();

      service.getMetrics().subscribe((result) => {
        expect(result).toEqual(metrics);
      });

      const req = httpMock.expectOne((r) =>
        r.url === `${baseUrl}/earthquakes/metrics`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(metrics);
    });

    it('should pass query params to metrics endpoint', () => {
      service.getMetrics({ minmagnitude: 3, limit: 100 }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${baseUrl}/earthquakes/metrics`,
      );
      expect(req.request.params.get('minmagnitude')).toBe('3');
      expect(req.request.params.get('limit')).toBe('100');
      req.flush(mockMetrics());
    });
  });
});
