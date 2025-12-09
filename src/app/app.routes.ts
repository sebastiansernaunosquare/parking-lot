import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
  },
  {
    path: 'portal',
    loadComponent: () => import('./features/resident/portal/portal').then(m => m.Portal),
    canActivate: [authGuard, roleGuard],
    data: { role: 'resident' } // <--- Aquí definimos que SOLO residentes entran
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
