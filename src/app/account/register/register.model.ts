export class Registration {
  id: number;
  login?: string | null;
  firstName?: string | null
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  langKey?: string | null
  password?: string | null;
  authorities?: string[] | null;
  
  constructor() {
    this.id = 0;
    this.login = null;
    this.firstName = null;
    this.lastName = null;
    this.email = null;
    this.phoneNumber = null;
    this.langKey = null;
    this.password = null;
    this.authorities = null; 
  }
 
}
