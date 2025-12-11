import { HttpInterceptorFn } from '@angular/common/http';
import { StateStorageService } from '../core/auth/state-storage.service';
import { inject } from '@angular/core';
 

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  // 🔥 Servisi burada alıyoruz (bu doğru kullanım)
  const stateStorage = inject(StateStorageService);

  if (req.method === 'OPTIONS') {
    return next(req);
  }

  if (req.url.includes('/api/authenticate')) {
    return next(req);
  }

  const token = getToken(stateStorage);
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};

function getToken(stateStorage: StateStorageService): string {
  // 1️⃣ Önce StateStorageService'ten bak
  const stored = stateStorage.getAuthenticationToken();
  if (stored) {
    return stored;  // StateStorageService JSON parse ediyor zaten
  }

  // 2️⃣ Son çare: global account objesi
  return '';
}
