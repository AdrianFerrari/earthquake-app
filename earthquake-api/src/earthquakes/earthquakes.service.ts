import { HttpService } from '@nestjs/axios';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { EarthquakeQueryDto } from './dto/earthquake-query.dto';
import {
  EarthquakeFeature,
  EarthquakeMetricsDto,
  EarthquakeResponseDto,
  EarthquakeSummary,
} from './dto/earthquake-response.dto';

@Injectable()
export class EarthquakesService {
  private readonly logger = new Logger(EarthquakesService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('usgs.baseUrl')!;
  }

  async findAll(query: EarthquakeQueryDto): Promise<EarthquakeSummary[]> {
    const cacheKey = `earthquakes:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<EarthquakeSummary[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached;
    }

    const params = this.buildParams(query);
    this.logger.log(
      `Fetching earthquakes with params: ${JSON.stringify(params)}`,
    );

    const data = await this.fetchFromUsgs(params);
    const summaries = data.features.map((f) => this.mapToSummary(f));

    await this.cacheManager.set(cacheKey, summaries);
    return summaries;
  }

  async getMetrics(query: EarthquakeQueryDto): Promise<EarthquakeMetricsDto> {
    const cacheKey = `metrics:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<EarthquakeMetricsDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for metrics key: ${cacheKey}`);
      return cached;
    }

    const params = this.buildParams({ ...query, limit: query.limit ?? 1000 });
    this.logger.log(`Fetching metrics with params: ${JSON.stringify(params)}`);

    const data = await this.fetchFromUsgs(params);
    const metrics = this.computeMetrics(data.features);

    await this.cacheManager.set(cacheKey, metrics);
    return metrics;
  }

  private buildParams(
    query: EarthquakeQueryDto,
  ): Record<string, string | number> {
    const defaults = {
      format: 'geojson',
      starttime: query.starttime ?? this.getDefaultStartTime(),
      endtime: query.endtime ?? this.getDefaultEndTime(),
      orderby: query.orderby ?? 'time',
      limit: query.limit ?? 100,
    };

    const params: Record<string, string | number> = { ...defaults };

    if (query.minmagnitude !== undefined && query.minmagnitude !== null) {
      params['minmagnitude'] = query.minmagnitude;
    }
    if (query.maxmagnitude !== undefined && query.maxmagnitude !== null) {
      params['maxmagnitude'] = query.maxmagnitude;
    }

    return params;
  }

  private async fetchFromUsgs(
    params: Record<string, string | number>,
  ): Promise<EarthquakeResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<EarthquakeResponseDto>(`${this.baseUrl}/query`, {
          params,
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `USGS API error: ${axiosError.message}`,
        axiosError.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch earthquake data from USGS',
      );
    }
  }

  private mapToSummary(feature: EarthquakeFeature): EarthquakeSummary {
    return {
      id: feature.id,
      magnitude: feature.properties.mag,
      place: feature.properties.place,
      time: feature.properties.time,
      alert: feature.properties.alert,
      tsunami: feature.properties.tsunami,
      coordinates: feature.geometry.coordinates,
      url: feature.properties.url,
      title: feature.properties.title,
      magType: feature.properties.magType,
      sig: feature.properties.sig,
    };
  }

  private computeMetrics(features: EarthquakeFeature[]): EarthquakeMetricsDto {
    const mags = features
      .map((f) => f.properties.mag)
      .filter((m): m is number => m !== null);

    const total = features.length;
    const averageMagnitude =
      mags.length > 0
        ? Math.round((mags.reduce((a, b) => a + b, 0) / mags.length) * 100) /
          100
        : 0;
    const maxMagnitude = mags.length > 0 ? Math.max(...mags) : 0;
    const minMagnitude = mags.length > 0 ? Math.min(...mags) : 0;

    const byAlertLevel: Record<string, number> = {};
    for (const f of features) {
      const level = f.properties.alert ?? 'none';
      byAlertLevel[level] = (byAlertLevel[level] ?? 0) + 1;
    }

    const byMagnitudeRange: Record<string, number> = {
      'micro (<2.0)': 0,
      'minor (2.0-3.9)': 0,
      'light (4.0-4.9)': 0,
      'moderate (5.0-5.9)': 0,
      'strong (6.0-6.9)': 0,
      'major (7.0+)': 0,
    };

    for (const mag of mags) {
      if (mag < 2.0) byMagnitudeRange['micro (<2.0)']++;
      else if (mag < 4.0) byMagnitudeRange['minor (2.0-3.9)']++;
      else if (mag < 5.0) byMagnitudeRange['light (4.0-4.9)']++;
      else if (mag < 6.0) byMagnitudeRange['moderate (5.0-5.9)']++;
      else if (mag < 7.0) byMagnitudeRange['strong (6.0-6.9)']++;
      else byMagnitudeRange['major (7.0+)']++;
    }

    const tsunamiWarnings = features.filter(
      (f) => f.properties.tsunami === 1,
    ).length;

    return {
      total,
      averageMagnitude,
      maxMagnitude,
      minMagnitude,
      byAlertLevel,
      byMagnitudeRange,
      tsunamiWarnings,
    };
  }

  private getDefaultStartTime(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }

  private getDefaultEndTime(): string {
    return new Date().toISOString().split('T')[0];
  }
}
