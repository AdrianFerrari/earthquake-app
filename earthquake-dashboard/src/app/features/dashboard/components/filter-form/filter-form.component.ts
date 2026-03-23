import { Component, ChangeDetectionStrategy, output, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EarthquakeQuery } from '../../../../core/models/earthquake.model';

@Component({
  selector: 'app-filter-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  host: { class: 'filter-form' },
  template: `
    <form class="filters" (ngSubmit)="submit()">
      <div class="filter-row">
        <div class="filter-group">
          <label for="starttime">Start Date</label>
          <input
            id="starttime"
            type="date"
            [(ngModel)]="starttime"
            name="starttime"
            aria-label="Start date filter"
          />
        </div>
        <div class="filter-group">
          <label for="endtime">End Date</label>
          <input
            id="endtime"
            type="date"
            [(ngModel)]="endtime"
            name="endtime"
            aria-label="End date filter"
          />
        </div>
        <div class="filter-group">
          <label for="minmag">Min Magnitude</label>
          <input
            id="minmag"
            type="number"
            min="-1"
            max="10"
            step="0.1"
            [(ngModel)]="minmagnitude"
            name="minmagnitude"
            aria-label="Minimum magnitude filter"
          />
        </div>
        <div class="filter-group">
          <label for="maxmag">Max Magnitude</label>
          <input
            id="maxmag"
            type="number"
            min="-1"
            max="10"
            step="0.1"
            [(ngModel)]="maxmagnitude"
            name="maxmagnitude"
            aria-label="Maximum magnitude filter"
          />
        </div>
        <div class="filter-group">
          <label for="orderby">Order By</label>
          <select id="orderby" [(ngModel)]="orderby" name="orderby" aria-label="Order by">
            <option value="time">Time (newest first)</option>
            <option value="time-asc">Time (oldest first)</option>
            <option value="magnitude">Magnitude (highest first)</option>
            <option value="magnitude-asc">Magnitude (lowest first)</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="limit">Limit</label>
          <select id="limit" [(ngModel)]="limit" name="limit" aria-label="Result limit">
            <option [ngValue]="25">25</option>
            <option [ngValue]="50">50</option>
            <option [ngValue]="100">100</option>
            <option [ngValue]="200">200</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button type="submit" class="btn btn-primary">Apply Filters</button>
        <button type="button" class="btn btn-secondary" (click)="reset()">Reset</button>
      </div>
    </form>
  `,
  styles: `
    :host { display: block; }
    .filters { display: flex; flex-direction: column; gap: 1rem; }
    .filter-row { display: flex; flex-wrap: wrap; gap: 1rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; min-width: 140px; }
    .filter-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .filter-group input, .filter-group select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; background: white; }
    .filter-actions { display: flex; gap: 0.75rem; }
    .btn { padding: 0.5rem 1.25rem; border-radius: 0.375rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; transition: background 0.15s; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-secondary:hover { background: #e2e8f0; }
  `,
})
export class FilterFormComponent {
  initialQuery = input<EarthquakeQuery>({});
  filtersChanged = output<EarthquakeQuery>();

  starttime = signal('');
  endtime = signal('');
  minmagnitude = signal<number | undefined>(undefined);
  maxmagnitude = signal<number | undefined>(undefined);
  orderby = signal<EarthquakeQuery['orderby']>('time');
  limit = signal(100);

  currentQuery = computed<EarthquakeQuery>(() => {
    const q: EarthquakeQuery = {
      orderby: this.orderby(),
      limit: this.limit(),
    };
    if (this.starttime()) q.starttime = this.starttime();
    if (this.endtime()) q.endtime = this.endtime();
    if (this.minmagnitude() !== undefined) q.minmagnitude = this.minmagnitude();
    if (this.maxmagnitude() !== undefined) q.maxmagnitude = this.maxmagnitude();
    return q;
  });

  submit(): void {
    this.filtersChanged.emit(this.currentQuery());
  }

  reset(): void {
    this.starttime.set('');
    this.endtime.set('');
    this.minmagnitude.set(undefined);
    this.maxmagnitude.set(undefined);
    this.orderby.set('time');
    this.limit.set(100);
    this.filtersChanged.emit({});
  }
}
