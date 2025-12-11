/**
 * Uygulama içerisindeki Dinamik Renk Tanımlarını İçerir.
 */
export let genelStyle: any = {
  //GENEL RENK START
  ANA_RENK: 'rgb(6, 136, 153)',
};

export const appVersion = '1.0.0';

export const appCode = 'Ekoloji'; //

export let isAndroid: boolean[] = [false];
export let isIos: boolean[] = [false];
export let isBrowser: boolean[] = [false];
export let isAndroidWebView: boolean[] = [false];
export let isIosWebView: boolean[] = [false];

 

export let GeneralSettings: {
  url: string;
  couchDB?: any;
  lang: string;
  code: string;
  title?: string;
  logo?: any;
} = {
  url: 'http://localhost:8080/api', // '../akgun-mobile/api'
  //couchDB: 'http://ivitaldata.akgun.com.tr/',
  lang: 'tr',
  code: '',
  title: '',
  logo: null,
};
