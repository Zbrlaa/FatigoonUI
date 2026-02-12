import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { FatigoonStore } from '../store/fatigoon.store';

export const authGuard: CanActivateFn = () => {
  const store = inject(FatigoonStore);
  const router = inject(Router);

  if (store.currentUser()) {
    return true;
  }

  return router.parseUrl('/login');
};