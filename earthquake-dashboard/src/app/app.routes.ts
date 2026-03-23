import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'metrics',
    loadComponent: () =>
      import('./features/metrics/pages/metrics-page/metrics-page.component').then(
        (m) => m.MetricsPageComponent,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
