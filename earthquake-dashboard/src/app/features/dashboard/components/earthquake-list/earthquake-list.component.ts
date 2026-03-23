import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { EarthquakeSummary } from '../../../../core/models/earthquake.model';
import { EarthquakeCardComponent } from '../earthquake-card/earthquake-card.component';

@Component({
  selector: 'app-earthquake-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EarthquakeCardComponent],
  host: { class: 'earthquake-list' },
  template: `
    @if (loading()) {
      <div class="loading-state" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading earthquakes...</p>
      </div>
    } @else if (error()) {
      <div class="error-state" role="alert">
        <p class="error-icon" aria-hidden="true">⚠️</p>
        <p>{{ error() }}</p>
      </div>
    } @else if (earthquakes().length === 0) {
      <div class="empty-state" role="status">
        <p class="empty-icon" aria-hidden="true">🔍</p>
        <p>No earthquakes found for the selected filters.</p>
      </div>
    } @else {
      <p class="result-count">Showing {{ earthquakes().length }} events</p>
      <div class="grid" role="list">
        @for (eq of earthquakes(); track eq.id) {
          <div role="listitem">
            <app-earthquake-card [earthquake]="eq" />
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .loading-state, .error-state, .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 3rem; text-align: center; color: #64748b;
    }
    .spinner {
      width: 40px; height: 40px; border: 4px solid #e2e8f0;
      border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-state { color: #ef4444; }
    .error-icon, .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .result-count { font-size: 0.875rem; color: #64748b; margin-bottom: 1rem; }
    .grid {
      display: grid; gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
  `,
})
export class EarthquakeListComponent {
  earthquakes = input.required<EarthquakeSummary[]>();
  loading = input(false);
  error = input<string | null>(null);
}
