import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EarthquakeSummary } from '../../../../core/models/earthquake.model';
import { EarthquakeCardComponent } from './earthquake-card.component';

const mockEarthquake = (overrides: Partial<EarthquakeSummary> = {}): EarthquakeSummary => ({
  id: 'eq1',
  magnitude: 4.5,
  place: '10km N of Test City, CA',
  time: 1700000000000,
  alert: null,
  tsunami: 0,
  coordinates: [-120.0, 37.0, 10.0],
  url: 'https://earthquake.usgs.gov/earthquakes/eventpage/eq1',
  title: 'M 4.5 - 10km N of Test City, CA',
  magType: 'ml',
  sig: 312,
  ...overrides,
});

describe('EarthquakeCardComponent', () => {
  let component: EarthquakeCardComponent;
  let fixture: ComponentFixture<EarthquakeCardComponent>;

  const render = (eq: EarthquakeSummary) => {
    fixture = TestBed.createComponent(EarthquakeCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('earthquake', eq);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarthquakeCardComponent],
    }).compileComponents();
  });

  it('should create', () => {
    render(mockEarthquake());
    expect(component).toBeTruthy();
  });

  it('should display the magnitude', () => {
    const el = render(mockEarthquake({ magnitude: 5.2 }));
    expect(el.querySelector('.magnitude')?.textContent?.trim()).toBe('5.2');
  });

  it('should display "N/A" when magnitude is null', () => {
    const el = render(mockEarthquake({ magnitude: null }));
    expect(el.querySelector('.magnitude')?.textContent?.trim()).toBe('N/A');
  });

  it('should display the place', () => {
    const el = render(mockEarthquake({ place: 'Near Tokyo, Japan' }));
    expect(el.querySelector('.place')?.textContent?.trim()).toBe('Near Tokyo, Japan');
  });

  it('should display "Unknown location" when place is null', () => {
    const el = render(mockEarthquake({ place: null }));
    expect(el.querySelector('.place')?.textContent?.trim()).toBe('Unknown location');
  });

  it('should show tsunami badge when tsunami flag is 1', () => {
    const el = render(mockEarthquake({ tsunami: 1 }));
    expect(el.querySelector('.tsunami-badge')).toBeTruthy();
  });

  it('should not show tsunami badge when tsunami flag is 0', () => {
    const el = render(mockEarthquake({ tsunami: 0 }));
    expect(el.querySelector('.tsunami-badge')).toBeFalsy();
  });

  it('should show alert badge when alert is set', () => {
    const el = render(mockEarthquake({ alert: 'green' }));
    expect(el.querySelector('.alert-badge')).toBeTruthy();
    expect(el.querySelector('.alert-badge')?.textContent?.trim()).toBe('GREEN');
  });

  it('should not show alert badge when alert is null', () => {
    const el = render(mockEarthquake({ alert: null }));
    expect(el.querySelector('.alert-badge')).toBeFalsy();
  });

  it('should apply alert-green host class when alert is green', () => {
    render(mockEarthquake({ alert: 'green' }));
    expect(fixture.nativeElement.classList.contains('alert-green')).toBe(true);
  });

  describe('magnitudeClass()', () => {
    it('should return "micro" for magnitude < 2.0', () => {
      render(mockEarthquake({ magnitude: 1.5 }));
      expect(component.magnitudeClass()).toBe('micro');
    });

    it('should return "minor" for magnitude 2.0–3.9', () => {
      render(mockEarthquake({ magnitude: 3.0 }));
      expect(component.magnitudeClass()).toBe('minor');
    });

    it('should return "light" for magnitude 4.0–4.9', () => {
      render(mockEarthquake({ magnitude: 4.5 }));
      expect(component.magnitudeClass()).toBe('light');
    });

    it('should return "moderate" for magnitude 5.0–5.9', () => {
      render(mockEarthquake({ magnitude: 5.5 }));
      expect(component.magnitudeClass()).toBe('moderate');
    });

    it('should return "strong" for magnitude 6.0–6.9', () => {
      render(mockEarthquake({ magnitude: 6.5 }));
      expect(component.magnitudeClass()).toBe('strong');
    });

    it('should return "major" for magnitude >= 7.0', () => {
      render(mockEarthquake({ magnitude: 7.5 }));
      expect(component.magnitudeClass()).toBe('major');
    });

    it('should return "unknown" for null magnitude', () => {
      render(mockEarthquake({ magnitude: null }));
      expect(component.magnitudeClass()).toBe('unknown');
    });
  });
});
