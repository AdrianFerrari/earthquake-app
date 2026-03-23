import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="top-nav" role="navigation" aria-label="Main navigation">
      <div class="nav-brand">
        <span class="nav-icon" aria-hidden="true">🌍</span>
        <span class="nav-title">EQ Dashboard</span>
      </div>
      <ul class="nav-links" role="list">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" aria-label="Dashboard">Dashboard</a>
        </li>
        <li>
          <a routerLink="/metrics" routerLinkActive="active" aria-label="Metrics">Metrics</a>
        </li>
      </ul>
    </nav>
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .top-nav {
      display: flex; align-items: center; gap: 2rem;
      padding: 0 1.5rem; height: 56px;
      background: #0f172a; color: white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .nav-brand { display: flex; align-items: center; gap: 0.5rem; }
    .nav-icon { font-size: 1.25rem; }
    .nav-title { font-weight: 800; font-size: 1rem; letter-spacing: -0.025em; }
    .nav-links { display: flex; gap: 0.25rem; list-style: none; margin: 0; padding: 0; }
    .nav-links a {
      padding: 0.375rem 0.875rem; border-radius: 0.375rem;
      color: #94a3b8; font-weight: 600; font-size: 0.875rem;
      text-decoration: none; transition: color 0.15s, background 0.15s;
    }
    .nav-links a:hover { color: white; background: rgba(255,255,255,0.08); }
    .nav-links a.active { color: white; background: rgba(255,255,255,0.12); }
    .main-content { flex: 1; background: #f8fafc; }
  `,
})
export class App {}
