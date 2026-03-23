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

export interface EarthquakeMetrics {
  total: number;
  averageMagnitude: number;
  maxMagnitude: number;
  minMagnitude: number;
  byAlertLevel: Record<string, number>;
  byMagnitudeRange: Record<string, number>;
  tsunamiWarnings: number;
}

export interface EarthquakeQuery {
  starttime?: string;
  endtime?: string;
  minmagnitude?: number;
  maxmagnitude?: number;
  orderby?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc';
  limit?: number;
}
