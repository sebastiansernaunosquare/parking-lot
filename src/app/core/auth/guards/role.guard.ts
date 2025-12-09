import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth.service';
import { UserRole } from '../../models/user.model';

export const roleGuard: CanActivateFn = (route): boolean | UrlTree => {
  const authService = inject(Auth);
  const router = inject(Router);
  const expectedRole = route.data['role'] as UserRole;
  const currentUser = authService.currentUser();

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  if (currentUser.role === expectedRole) {
    return true;
  }

  if (currentUser.role === 'admin') {
    return router.createUrlTree(['/admin']);
  }

  return router.createUrlTree(['/portal']);
};
