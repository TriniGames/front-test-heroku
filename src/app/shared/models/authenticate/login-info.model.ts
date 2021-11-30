export interface ILoginInfo {
    Email: string | null;
    Password: string | null;
    GetToken: boolean | null;
}

export class LoginInfo implements ILoginInfo {
    constructor(
        public Email: string | null = null,
        public Password: string | null = null,
        public GetToken: boolean | null = true,
    ) { }
}
