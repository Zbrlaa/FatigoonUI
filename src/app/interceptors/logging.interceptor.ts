import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  console.log(`🚀 [HTTP Request] ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) {
          const elapsed = Date.now() - startTime;
          console.log(`✅ [HTTP Response] ${req.url} - ${elapsed}ms`);
        }
      },
      error: (err) => {
        console.error(`❌ [HTTP Error] ${req.url}`, err);
      }
    })
  );
};