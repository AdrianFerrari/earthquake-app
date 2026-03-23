import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EarthquakeMetrics, EarthquakeQuery, EarthquakeSummary } from '../models/earthquake.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EarthquakeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getEarthquakes(query: EarthquakeQuery = {}): Observable<EarthquakeSummary[]> {
    const params = this.buildParams(query);
    return this.http.get<EarthquakeSummary[]>(`${this.apiUrl}/earthquakes`, { params });
  }

  getMetrics(query: EarthquakeQuery = {}): Observable<EarthquakeMetrics> {
    const params = this.buildParams(query);
    return this.http.get<EarthquakeMetrics>(`${this.apiUrl}/earthquakes/metrics`, { params });
  }

  private buildParams(query: EarthquakeQuery): HttpParams {
    let params = new HttpParams();
    if (query.starttime) params = params.set('starttime', query.starttime);
    if (query.endtime) params = params.set('endtime', query.endtime);
    if (query.minmagnitude !== undefined && query.minmagnitude !== null) params = params.set('minmagnitude', query.minmagnitude);
    if (query.maxmagnitude !== undefined && query.maxmagnitude !== null) params = params.set('maxmagnitude', query.maxmagnitude);
    if (query.orderby) params = params.set('orderby', query.orderby);
    if (query.limit !== undefined && query.limit !== null) params = params.set('limit', query.limit);
    return params;
  }
}
