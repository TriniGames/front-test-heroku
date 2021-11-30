import * as fromAuthenticate from '../../modules/authenticate/store/authenticate.reducer';

import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthenticateService } from 'src/app/modules/authenticate/services/authenticate.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserInformation } from 'src/app/modules/authenticate/store/authenticate.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private store: Store<{ [fromAuthenticate.authenticateFeatureKey]: fromAuthenticate.State }>,
    private authenticateService: AuthenticateService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.store.select(selectUserInformation).pipe(
      take(1),
      map(user => {
        if (!!user && user.jwt && !this.authenticateService.isTokenExpired(user.jwt)) {
          return true;
        }

        return this.router.createUrlTree(['/auth']);
      })
    );
  }

}
