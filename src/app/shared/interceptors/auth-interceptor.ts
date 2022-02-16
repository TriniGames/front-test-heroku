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
import { ShowLoaderAction, HideLoaderAction } from '../store/loader.actions';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];
  private subscriptions: Subscription[] = [];
  constructor(private readonly store: Store, private readonly router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.store.selectSnapshot(AuthenticateState.token);

    this.store.dispatch(new ShowLoaderAction());

    if (!req.url.includes('user/login')) {
      req = req.clone({
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('authorization', token),
      });
    }

    return next.handle(req).pipe(
      finalize(() => this.store.dispatch(new HideLoaderAction())),
      catchError((error) => {
        this.store.dispatch(new SignOut()).subscribe(() => {
          this.router.navigate(['/auth']);
        });
        this.store.dispatch(new HideLoaderAction());
        return throwError(() => error);
      })
    );
  }
}
