export interface EarthquakeProperties {
  mag: number | null;
  place: string | null;
  time: number;
  updated: number;
  url: string;
  detail: string;
  felt: number | null;
  cdi: number | null;
  mmi: number | null;
  alert: string | null;
  status: string;
  tsunami: number;
  sig: number;
  net: string;
  code: string;
  ids: string;
  sources: string;
  types: string;
  nst: number | null;
  dmin: number | null;
  rms: number | null;
  gap: number | null;
  magType: string | null;
  type: string;
  title: string;
}

export interface EarthquakeGeometry {
  type: 'Point';
  coordinates: [number, number, number];
}

export interface EarthquakeFeature {
  type: 'Feature';
  properties: EarthquakeProperties;
  geometry: EarthquakeGeometry;
  id: string;
}

export interface EarthquakeResponseDto {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: EarthquakeFeature[];
}

export interface EarthquakeSummary {
  id: string;
  magnitude: number | null;
  place: string | null;
  time: number;
  alert: string | null;
  tsunami: number;
  coordinates: [number, number, number];
  url: string;
  title: string;
  magType: string | null;
  sig: number;
}

export interface EarthquakeMetricsDto {
  total: number;
  averageMagnitude: number;
  maxMagnitude: number;
  minMagnitude: number;
  byAlertLevel: Record<string, number>;
  byMagnitudeRange: Record<string, number>;
  tsunamiWarnings: number;
}
