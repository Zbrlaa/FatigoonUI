import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'guild/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/guild-details/guild-details.component').then(m => m.GuildDetailsComponent)
  },
  {
    path: 'print',
    canActivate: [authGuard],
    loadComponent: () => import('./components/print/print.component').then(m => m.PrintComponent)
  },
  {
    path: 'print-preview',
    canActivate: [authGuard],
    loadComponent: () => import('./components/print-preview/print-preview.component').then(m => m.PrintPreviewComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];