import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EarthquakeQueryDto } from './dto/earthquake-query.dto';
import { EarthquakesService } from './earthquakes.service';

@Controller('earthquakes')
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(@Query() query: EarthquakeQueryDto) {
    return this.earthquakesService.findAll(query);
  }

  @Get('metrics')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getMetrics(@Query() query: EarthquakeQueryDto) {
    return this.earthquakesService.getMetrics(query);
  }
}
