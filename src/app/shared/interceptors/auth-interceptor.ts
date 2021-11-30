import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthenticateState } from 'src/app/modules/authenticate/store/authenticate.state';
import { LoaderService } from '../services/loader-services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private loaderService: LoaderService, private store: Store) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.store.selectSnapshot(AuthenticateState.token);

    // const spinnerSubscription: Subscription =
    //   this.loaderService.spinner$.subscribe();

    if (req.url.includes('user/login')) {
      return next.handle(req).pipe(
        finalize(() => {
          // spinnerSubscription.unsubscribe();
        })
      );
    } else {
      const loginReq = req.clone({
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('authorization', token),
      });

      return next.handle(loginReq).pipe(finalize(() => {}));
    }
  }
}
