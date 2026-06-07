export class LoginVM {
  constructor(

    public username: string,
    public password: string,
    public rememberMe: boolean,
    public lang: string = 'en',
    public email:string,
    public phone:string,
    public captchaToken:string

  ) {}
}
