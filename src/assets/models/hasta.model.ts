export interface IHasta {
  // id?: number;
  ad?: string;
  soyad?: string;
  // kimlikNo?: string;
  // telefon?: string;
  // cinsiyet?: string;
  // aciklama?: string;
  // il?: string;
  // ilce?: string;
  // mahalle?: string;
  // adres?: string;
  // kanGrubu?: string;
}
export class Hasta implements IHasta {
  constructor(
    // public id?: number,
    public ad?: string,
    public soyad?: string,
    // public kimlikNo?: string,
    // public telefon?: string,
    // public cinsiyet?: string,
    // public aciklama?: string,
    // public il?: string,
    // public ilce?: string,
    // public mahalle?: string,
    // public adres?: string,
    // public kanGrubu?: string,
  ) {}
}
