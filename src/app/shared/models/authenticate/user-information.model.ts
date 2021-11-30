export interface IUserInformation {
  _id: string | null;
  jwt: string | null;
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
}
export class UserInformation implements IUserInformation {
  constructor(
    public _id: string | null = null,
    public jwt: string | null = null,
    public FirstName: string | null = null,
    public LastName: string | null = null,
    public Email: string | null = null
  ) {}
}
