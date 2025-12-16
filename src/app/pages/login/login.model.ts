export class Login {
  constructor(

    public username: string,
    public password: string,
    public rememberMe: boolean,
    public lang: string = 'en',
    public email:string,
    public phone:string

  ) {}
}
