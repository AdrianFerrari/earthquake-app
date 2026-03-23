import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { EarthquakeQuery, EarthquakeMetrics } from '../../../../core/models/earthquake.model';
import { EarthquakeService } from '../../../../core/services/earthquake.service';
import { FilterFormComponent } from '../../../dashboard/components/filter-form/filter-form.component';
import { MetricsPanelComponent } from '../../components/metrics-panel/metrics-panel.component';

@Component({
  selector: 'app-metrics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterFormComponent, MetricsPanelComponent],
  host: { class: 'metrics-page' },
  template: `
    <header class="page-header">
      <h1>Earthquake Metrics</h1>
      <p class="subtitle">Statistical analysis of seismic activity</p>
    </header>

    <section class="filters-section" aria-label="Filters">
      <app-filter-form (filtersChanged)="onFiltersChanged($event)" />
    </section>

    <section class="metrics-section" aria-label="Metrics">
      @if (error()) {
        <div class="error-state" role="alert">
          <p>⚠️ {{ error() }}</p>
        </div>
      } @else {
        <app-metrics-panel [metrics]="metrics()" [loading]="loading()" />
      }
    </section>
  `,
  styles: `
    :host { display: block; max-width: 1280px; margin: 0 auto; padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
    .subtitle { color: #64748b; margin: 0; font-size: 0.9375rem; }
    .filters-section { background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.25rem; margin-bottom: 1.5rem; }
    .error-state { padding: 2rem; text-align: center; color: #ef4444; }
  `,
})
export class MetricsPageComponent implements OnInit {
  private readonly earthquakeService = inject(EarthquakeService);

  metrics = signal<EarthquakeMetrics | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadMetrics({});
  }

  onFiltersChanged(query: EarthquakeQuery): void {
    this.loadMetrics(query);
  }

  private loadMetrics(query: EarthquakeQuery): void {
    this.loading.set(true);
    this.error.set(null);

    this.earthquakeService.getMetrics(query).subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message ?? 'Failed to load metrics');
        this.loading.set(false);
      },
    });
  }
}
