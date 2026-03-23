import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { EarthquakeMetrics } from '../../../../core/models/earthquake.model';

@Component({
  selector: 'app-metrics-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'metrics-panel' },
  template: `
    @if (loading()) {
      <div class="loading-state" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading metrics...</p>
      </div>
    } @else if (metrics()) {
      <div class="stat-cards" role="region" aria-label="Earthquake statistics">
        <div class="stat-card" role="group" aria-label="Total events">
          <span class="stat-value">{{ metrics()!.total }}</span>
          <span class="stat-label">Total Events</span>
        </div>
        <div class="stat-card" role="group" aria-label="Average magnitude">
          <span class="stat-value">{{ metrics()!.averageMagnitude.toFixed(2) }}</span>
          <span class="stat-label">Avg Magnitude</span>
        </div>
        <div class="stat-card highlight-max" role="group" aria-label="Maximum magnitude">
          <span class="stat-value">{{ metrics()!.maxMagnitude.toFixed(1) }}</span>
          <span class="stat-label">Max Magnitude</span>
        </div>
        <div class="stat-card" role="group" aria-label="Minimum magnitude">
          <span class="stat-value">{{ metrics()!.minMagnitude.toFixed(1) }}</span>
          <span class="stat-label">Min Magnitude</span>
        </div>
        @if (metrics()!.tsunamiWarnings > 0) {
          <div class="stat-card highlight-tsunami" role="group" aria-label="Tsunami warnings">
            <span class="stat-value">{{ metrics()!.tsunamiWarnings }}</span>
            <span class="stat-label">🌊 Tsunami Warnings</span>
          </div>
        }
      </div>

      <div class="charts-row">
        <div class="chart-section" role="region" aria-label="Events by magnitude range">
          <h3>By Magnitude Range</h3>
          @for (entry of magnitudeEntries(); track entry.label) {
            <div class="bar-row">
              <span class="bar-label">{{ entry.label }}</span>
              <div class="bar-track" role="progressbar" [attr.aria-valuenow]="entry.count" [attr.aria-valuemax]="metrics()!.total" [attr.aria-label]="entry.label">
                <div class="bar-fill" [style.width.%]="entry.percentage" [class]="'bar-' + entry.key"></div>
              </div>
              <span class="bar-count">{{ entry.count }}</span>
            </div>
          }
        </div>

        <div class="chart-section" role="region" aria-label="Events by alert level">
          <h3>By Alert Level</h3>
          @for (entry of alertEntries(); track entry.label) {
            <div class="bar-row">
              <span class="bar-label">{{ entry.label }}</span>
              <div class="bar-track" role="progressbar" [attr.aria-valuenow]="entry.count" [attr.aria-valuemax]="metrics()!.total" [attr.aria-label]="entry.label">
                <div class="bar-fill" [class]="'alert-bar-' + entry.key" [style.width.%]="entry.percentage"></div>
              </div>
              <span class="bar-count">{{ entry.count }}</span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 2rem; color: #64748b; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .stat-cards { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.25rem 1.5rem; min-width: 130px; display: flex; flex-direction: column; gap: 0.25rem; }
    .stat-value { font-size: 2rem; font-weight: 800; color: #1e293b; line-height: 1; }
    .stat-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .highlight-max .stat-value { color: #ef4444; }
    .highlight-tsunami { border-left: 3px solid #3b82f6; }
    .highlight-tsunami .stat-value { color: #1d4ed8; }
    .charts-row { display: flex; flex-wrap: wrap; gap: 1.5rem; }
    .chart-section { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.25rem; flex: 1; min-width: 280px; }
    .chart-section h3 { font-size: 0.875rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 1rem; }
    .bar-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .bar-label { font-size: 0.75rem; color: #64748b; width: 130px; flex-shrink: 0; }
    .bar-track { flex: 1; height: 12px; background: #f1f5f9; border-radius: 9999px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 9999px; transition: width 0.5s ease; min-width: 2px; }
    .bar-count { font-size: 0.75rem; font-weight: 600; color: #475569; width: 30px; text-align: right; }
    .bar-micro { background: #94a3b8; }
    .bar-minor { background: #64748b; }
    .bar-light { background: #22c55e; }
    .bar-moderate { background: #f59e0b; }
    .bar-strong { background: #f97316; }
    .bar-major { background: #ef4444; }
    .alert-bar-none { background: #94a3b8; }
    .alert-bar-green { background: #22c55e; }
    .alert-bar-yellow { background: #eab308; }
    .alert-bar-orange { background: #f97316; }
    .alert-bar-red { background: #ef4444; }
  `,
})
export class MetricsPanelComponent {
  metrics = input<EarthquakeMetrics | null>(null);
  loading = input(false);

  magnitudeEntries = computed(() => {
    const m = this.metrics();
    if (!m) return [];
    const total = m.total || 1;
    const keyMap: Record<string, string> = {
      'micro (<2.0)': 'micro',
      'minor (2.0-3.9)': 'minor',
      'light (4.0-4.9)': 'light',
      'moderate (5.0-5.9)': 'moderate',
      'strong (6.0-6.9)': 'strong',
      'major (7.0+)': 'major',
    };
    return Object.entries(m.byMagnitudeRange).map(([label, count]) => ({
      label,
      count,
      key: keyMap[label] ?? 'minor',
      percentage: Math.round((count / total) * 100),
    }));
  });

  alertEntries = computed(() => {
    const m = this.metrics();
    if (!m) return [];
    const total = m.total || 1;
    return Object.entries(m.byAlertLevel).map(([label, count]) => ({
      label: label === 'none' ? 'No Alert' : label.charAt(0).toUpperCase() + label.slice(1),
      count,
      key: label,
      percentage: Math.round((count / total) * 100),
    }));
  });
}
