/**
 * Uygulama içerisindeki Dinamik Renk Tanımlarını İçerir.
 */
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';

const getApiUrl = (): string => {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') {
    return 'https://192.168.1.7:8080';   // emülatör
  }
  if (platform === 'ios') {
    return 'https://localhost:8080';
  }

 return environment.apiUrl
 // return 'https://192.168.1.7:8080';     // browser
};

export let genelStyle: any = {
  //GENEL RENK START
  ANA_RENK: 'rgb(6, 136, 153)',
};

export const appVersion = '1.0.0';

export const appCode = 'Bosphore'; //

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
   // Android emülatörü için:
  url: getApiUrl(),
  //url: 'https://localhost:8080',
  //couchDB: 'https://ivitaldata.akgun.com.tr/',
  lang: 'fr',
  code: '',
  title: '',
  logo: null,
};

export const Langs: any = [
  { lang: 'Türkçe', flag: './assets/img/turk.png', code: 'tr' },
  { lang: 'English', flag: './assets/img/english.png', code: 'en' },
  { lang: 'French', flag: './assets/img/russia.png', code: 'fr' },
  { lang: 'German', flag: './assets/img/kazakhistan.png', code: 'gm' },
  { lang: 'عربى', flag: './assets/img/arabia.png', code: 'ar' },
];

