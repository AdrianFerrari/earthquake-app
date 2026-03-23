import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EarthquakesController } from './earthquakes.controller';
import { EarthquakesService } from './earthquakes.service';

@Module({
  imports: [HttpModule],
  controllers: [EarthquakesController],
  providers: [EarthquakesService],
  exports: [EarthquakesService],
})
export class EarthquakesModule {}
