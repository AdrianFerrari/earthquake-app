import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class EarthquakeQueryDto {
  @IsOptional()
  @IsDateString()
  starttime?: string;

  @IsOptional()
  @IsDateString()
  endtime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-1)
  @Max(10)
  minmagnitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-1)
  @Max(10)
  maxmagnitude?: number;

  @IsOptional()
  @IsIn(['time', 'time-asc', 'magnitude', 'magnitude-asc'])
  orderby?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(1000)
  limit?: number;
}
