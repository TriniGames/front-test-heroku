import { Action, Selector, State } from '@ngxs/store';
import {
  GetLogin,
  InvalidLogin,
  SetUserInformation,
  SignOut,
} from './authenticate.actions';

import { AuthenticateService } from '../services/authenticate.service';
import { Injectable } from '@angular/core';
import { StateContext } from '@ngxs/store';
import { UserInformation } from 'src/app/shared/models/authenticate/user-information.model';
import { tap } from 'rxjs/operators';

export interface Authentication {
  userInformation: UserInformation | null;
  invalidLogin: boolean;
}

@State<Authentication>({
  name: 'authenticate',
  defaults: {
    userInformation: null,
    invalidLogin: false,
  },
})
@Injectable()
export class AuthenticateState {
  constructor(private authenticateService: AuthenticateService) {}

  @Selector()
  static token(state: Authentication): string {
    return state.userInformation?.jwt ?? '';
  }

  @Selector()
  static selectInvalidLogin(state: Authentication) {
    return state.invalidLogin;
  }

  @Selector()
  static selectUserInformation(state: Authentication) {
    return state.userInformation;
  }

  @Action(SetUserInformation)
  setUserInformation(
    context: StateContext<Authentication>,
    action: SetUserInformation
  ) {
    context.patchState({
      userInformation: action.userInformation,
    });
  }

  @Action(GetLogin)
  getLogin(context: StateContext<Authentication>, action: GetLogin) {
    return this.authenticateService.login(action.loginInfo).pipe(
      tap((loginInfo) => {
        context.patchState({
          userInformation: loginInfo,
        });
      })
    );
  }

  @Action(SignOut)
  signOut(context: StateContext<Authentication>) {
    return this.authenticateService.signout().pipe(
      tap((_) => {
        context.patchState({ userInformation: null });
      })
    );
  }

  @Action(InvalidLogin)
  invalidLogin(context: StateContext<Authentication>, action: InvalidLogin) {
    context.patchState({
      invalidLogin: action.invalidLoginAttemp,
    });
  }
}
