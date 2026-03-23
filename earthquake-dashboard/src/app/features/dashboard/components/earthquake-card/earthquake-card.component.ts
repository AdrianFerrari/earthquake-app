import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { EarthquakeSummary } from '../../../../core/models/earthquake.model';
import { MagnitudeLabelPipe } from '../../../../shared/pipes/magnitude-label.pipe';

@Component({
  selector: 'app-earthquake-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, UpperCasePipe, MagnitudeLabelPipe],
  host: {
    class: 'earthquake-card',
    '[class.alert-green]': 'earthquake().alert === "green"',
    '[class.alert-yellow]': 'earthquake().alert === "yellow"',
    '[class.alert-orange]': 'earthquake().alert === "orange"',
    '[class.alert-red]': 'earthquake().alert === "red"',
    '[class.tsunami-warning]': 'earthquake().tsunami === 1',
    'role': 'article',
    '[attr.aria-label]': 'earthquake().title',
  },
  template: `
    <div class="card-header">
      <span class="magnitude" [class]="'mag-' + magnitudeClass()">
        {{ earthquake().magnitude !== null ? earthquake().magnitude!.toFixed(1) : 'N/A' }}
      </span>
      <span class="magnitude-label">{{ earthquake().magnitude | magnitudeLabel }}</span>
      @if (earthquake().tsunami === 1) {
        <span class="tsunami-badge" role="img" aria-label="Tsunami warning">🌊 Tsunami</span>
      }
      @if (earthquake().alert) {
        <span class="alert-badge" [class]="'alert-' + earthquake().alert">
          {{ earthquake().alert | uppercase }}
        </span>
      }
    </div>
    <div class="card-body">
      <p class="place">{{ earthquake().place ?? 'Unknown location' }}</p>
      <p class="time">{{ earthquake().time | date:'medium' }}</p>
      <p class="coords">
        {{ earthquake().coordinates[1].toFixed(3) }}°,
        {{ earthquake().coordinates[0].toFixed(3) }}°
        @ {{ earthquake().coordinates[2].toFixed(1) }}km
      </p>
    </div>
    <div class="card-footer">
      <span class="sig">Significance: {{ earthquake().sig }}</span>
      <a
        [href]="earthquake().url"
        target="_blank"
        rel="noopener noreferrer"
        class="details-link"
        [attr.aria-label]="'View details for ' + earthquake().title"
      >Details</a>
    </div>
  `,
  styles: `
    :host { display: block; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.12); padding: 1rem; border-left: 4px solid #e2e8f0; transition: box-shadow 0.2s; }
    :host:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    :host.alert-green { border-left-color: #22c55e; }
    :host.alert-yellow { border-left-color: #eab308; }
    :host.alert-orange { border-left-color: #f97316; }
    :host.alert-red { border-left-color: #ef4444; }
    :host.tsunami-warning { background: #fefce8; }
    .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .magnitude { font-size: 1.75rem; font-weight: 800; line-height: 1; }
    .mag-micro { color: #94a3b8; }
    .mag-minor { color: #64748b; }
    .mag-light { color: #16a34a; }
    .mag-moderate { color: #d97706; }
    .mag-strong { color: #ea580c; }
    .mag-major { color: #dc2626; }
    .magnitude-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .tsunami-badge { font-size: 0.75rem; font-weight: 700; color: #1d4ed8; background: #dbeafe; padding: 0.125rem 0.5rem; border-radius: 9999px; }
    .alert-badge { font-size: 0.75rem; font-weight: 700; padding: 0.125rem 0.5rem; border-radius: 9999px; text-transform: uppercase; }
    .alert-green { color: #15803d; background: #dcfce7; }
    .alert-yellow { color: #854d0e; background: #fef9c3; }
    .alert-orange { color: #9a3412; background: #ffedd5; }
    .alert-red { color: #7f1d1d; background: #fee2e2; }
    .card-body { margin-bottom: 0.75rem; }
    .place { font-weight: 600; color: #1e293b; margin: 0 0 0.25rem; }
    .time { font-size: 0.8125rem; color: #64748b; margin: 0 0 0.25rem; }
    .coords { font-size: 0.75rem; color: #94a3b8; font-family: monospace; margin: 0; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 0.5rem; }
    .sig { font-size: 0.75rem; color: #94a3b8; }
    .details-link { font-size: 0.8125rem; font-weight: 600; color: #3b82f6; text-decoration: none; }
    .details-link:hover { text-decoration: underline; }
  `,
})
export class EarthquakeCardComponent {
  earthquake = input.required<EarthquakeSummary>();
  cardClicked = output<EarthquakeSummary>();

  magnitudeClass(): string {
    const mag = this.earthquake().magnitude;
    if (mag === null) return 'unknown';
    if (mag < 2.0) return 'micro';
    if (mag < 4.0) return 'minor';
    if (mag < 5.0) return 'light';
    if (mag < 6.0) return 'moderate';
    if (mag < 7.0) return 'strong';
    return 'major';
  }
}
