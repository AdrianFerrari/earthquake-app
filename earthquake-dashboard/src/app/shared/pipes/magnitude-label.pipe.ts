import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'magnitudeLabel' })
export class MagnitudeLabelPipe implements PipeTransform {
  transform(magnitude: number | null): string {
    if (magnitude === null) return 'Unknown';
    if (magnitude < 2.0) return 'Micro';
    if (magnitude < 4.0) return 'Minor';
    if (magnitude < 5.0) return 'Light';
    if (magnitude < 6.0) return 'Moderate';
    if (magnitude < 7.0) return 'Strong';
    return 'Major';
  }
}
