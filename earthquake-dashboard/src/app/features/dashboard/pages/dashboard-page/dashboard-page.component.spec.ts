import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EarthquakeSummary } from '../../../../core/models/earthquake.model';
import { EarthquakeService } from '../../../../core/services/earthquake.service';
import { DashboardPageComponent } from './dashboard-page.component';

const makeSummary = (id: string, mag: number): EarthquakeSummary => ({
  id,
  magnitude: mag,
  place: `${id} location`,
  time: 1700000000000,
  alert: null,
  tsunami: 0,
  coordinates: [-120, 37, 10],
  url: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
  title: `M ${mag} - ${id} location`,
  magType: 'ml',
  sig: 100,
});

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        EarthquakeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/earthquakes'));
    req.flush([]);
    expect(component).toBeTruthy();
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(true);
    const req = httpMock.expectOne((r) => r.url.includes('/earthquakes'));
    req.flush([]);
  });

  it('should display earthquakes after successful load', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/earthquakes'));
    const data = [makeSummary('eq1', 4.5), makeSummary('eq2', 3.2)];
    req.flush(data);
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.earthquakes()).toHaveLength(2);
    expect(component.error()).toBeNull();
  });

  it('should show error state when request fails', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/earthquakes'));
    req.error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.error()).not.toBeNull();
  });

  it('should reload data when filters change', () => {
    fixture.detectChanges();
    const req1 = httpMock.expectOne((r) => r.url.includes('/earthquakes'));
    req1.flush([makeSummary('eq1', 4.5)]);
    fixture.detectChanges();

    component.onFiltersChanged({ minmagnitude: 5.0 });
    fixture.detectChanges();

    const req2 = httpMock.expectOne((r) => r.url.includes('/earthquakes'));
    expect(req2.request.params.get('minmagnitude')).toBe('5');
    req2.flush([makeSummary('eq2', 5.5)]);
    fixture.detectChanges();

    expect(component.earthquakes()).toHaveLength(1);
    expect(component.earthquakes()[0].id).toBe('eq2');
  });
});
