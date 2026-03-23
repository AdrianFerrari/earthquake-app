import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { EarthquakeQuery, EarthquakeSummary } from '../../../../core/models/earthquake.model';
import { EarthquakeService } from '../../../../core/services/earthquake.service';
import { FilterFormComponent } from '../../components/filter-form/filter-form.component';
import { EarthquakeListComponent } from '../../components/earthquake-list/earthquake-list.component';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterFormComponent, EarthquakeListComponent],
  host: { class: 'dashboard-page' },
  template: `
    <header class="page-header">
      <h1>Earthquake Dashboard</h1>
      <p class="subtitle">Real-time seismic activity powered by USGS</p>
    </header>

    <section class="filters-section" aria-label="Filters">
      <app-filter-form (filtersChanged)="onFiltersChanged($event)" />
    </section>

    <section class="list-section" aria-label="Earthquake list">
      <app-earthquake-list
        [earthquakes]="earthquakes()"
        [loading]="loading()"
        [error]="error()"
      />
    </section>
  `,
  styles: `
    :host { display: block; max-width: 1280px; margin: 0 auto; padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
    .subtitle { color: #64748b; margin: 0; font-size: 0.9375rem; }
    .filters-section { background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.25rem; margin-bottom: 1.5rem; }
    .list-section { min-height: 400px; }
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly earthquakeService = inject(EarthquakeService);

  earthquakes = signal<EarthquakeSummary[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private currentQuery: EarthquakeQuery = {};

  ngOnInit(): void {
    this.loadEarthquakes({});
  }

  onFiltersChanged(query: EarthquakeQuery): void {
    this.currentQuery = query;
    this.loadEarthquakes(query);
  }

  private loadEarthquakes(query: EarthquakeQuery): void {
    this.loading.set(true);
    this.error.set(null);

    this.earthquakeService.getEarthquakes(query).subscribe({
      next: (data) => {
        this.earthquakes.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message ?? 'Failed to load earthquakes');
        this.loading.set(false);
      },
    });
  }
}
