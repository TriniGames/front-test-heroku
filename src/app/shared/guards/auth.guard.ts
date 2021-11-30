import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthenticateService } from 'src/app/modules/authenticate/services/authenticate.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthenticateState } from 'src/app/modules/authenticate/store/authenticate.state';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticateService: AuthenticateService,
    private store: Store
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = this.store.selectSnapshot(AuthenticateState.token);

    if (token) {
      return !this.authenticateService.isTokenExpired(token);
    } else {
      return this.router.createUrlTree(['/auth']);
    }
  }
}
