import { LoginInfo } from 'src/app/shared/models/authenticate/login-info.model';
import { UserInformation } from 'src/app/shared/models/authenticate/user-information.model';

export class SetUserInformation {
  static readonly type = '[AUTHENTICATE] Save User Information ';
  constructor(public userInformation: UserInformation) {}
}

export class GetLogin {
  static readonly type = '[AUTHENTICATE] Get Login';
  constructor(public loginInfo: LoginInfo) {}
}

export class SignOut {
  static readonly type = '[AUTHENTICATE] SignOut';
}

export class InvalidLogin {
  static readonly type = '[AUTHENTICATE] InvalidLogin';
  constructor(public invalidLoginAttemp: boolean) {}
}
