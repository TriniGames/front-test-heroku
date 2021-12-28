import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { AuthenticateState } from 'src/app/modules/authenticate/store/authenticate.state';
import { Injectable } from '@angular/core';
import { LoaderService } from '../services/loader-services';
import { Router } from '@angular/router';
import { SignOut } from 'src/app/modules/authenticate/store/authenticate.actions';
import { Store } from '@ngxs/store';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];
  private subscriptions: Subscription[] = [];
  constructor(
    private readonly loaderService: LoaderService,
    private readonly store: Store,
    private readonly router: Router
  ) {}

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);

    if (i >= 0) {
      this.requests.splice(i, 1);
      // this.subscriptions[i].unsubscribe();
      // this.subscriptions.splice(i, 1);
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.store.selectSnapshot(AuthenticateState.token);

    // this.subscriptions.push(this.loaderService.spinner$.subscribe());

    if (!req.url.includes('user/login')) {
      req = req.clone({
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('authorization', token),
      });
    }

    this.requests.push(req);

    return next.handle(req).pipe(
      finalize(() => {
        this.removeRequest(req);
      }),
      catchError((error) => {
        this.store.dispatch(new SignOut()).subscribe(() => {
          this.router.navigate(['/auth']);
        });
        return throwError(() => error);
      })
    );
  }
}
