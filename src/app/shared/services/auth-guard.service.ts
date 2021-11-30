import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthenticateState } from 'src/app/modules/authenticate/store/authenticate.state';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(private _router: Router, private store: Store) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    //check some condition
    const token = this.store.selectSnapshot(AuthenticateState.token);


    
    if (true) {
      alert('No puedes acceder a esta pagina');
      //redirect to login/home page etc
      //return false to cancel the navigation
      return false;
    }
    return true;
  }
}
