export class Bosp {

  public static isIdEmpty(value: any) {
    if (value === null|| value === undefined ||value === '' || value.length == 0) {
      return true;
    }
    return false;
  }

 public static isEmpty(value: any): boolean {
  // Null veya undefined
  if (value === null || value === undefined) {
    return true;
  }

  // String ve sadece boşluk içeren string
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }

  // Boş array
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  // Boş object
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
    return true;
  }

  // Özel durum: -1 boş kabul edilsin mi?
  if (value === -1) {
    return true;
  }

  // Diğer tüm durumlar boş değil
  return false;
}

public static getValue(obj: any, propertyPath: string): number {
  // Obje veya property path boşsa 0 döndür
  if (!obj || !propertyPath || this.isEmpty(obj) || this.isEmpty(propertyPath)) {
    return 0;
  }

  // Property path'i parçalara ayır (nested property'ler için)
  const properties = propertyPath.split('.');
  let currentValue = obj;

  // Nested property'leri tek tek gez
  for (const prop of properties) {
    if (currentValue === null || currentValue === undefined || !(prop in currentValue)) {
      return 0;
    }
    currentValue = currentValue[prop];
  }

  // Eğer son değer boşsa 0 döndür
  if (this.isEmpty(currentValue)) {
    return 0;
  }

  // Sayısal değere çevir
  const numericValue = Number(currentValue);
  
  // NaN kontrolü
  if (isNaN(numericValue)) {
    return 0;
  }

  return numericValue;
}


  public static getSearcCriters(data: any): any {
    let mykeys = Object.keys(data);
    let myvalues: any = Object.values(data);
    let params: any = {
      page: 0,
      size: 12,
      sort: 'id,DESC',
    };

    for (let i = 0; i < mykeys.length; i++) {
      if (String(myvalues[i]).length > 0) {
        // Diğer filtrelemeler için yapılabilir
        if (typeof myvalues[i] === 'number') {
          params[String(mykeys[i]) + '.equals'] = Number(myvalues[i]); // Eğer modeldeki bir key'in value'sı dolu ise onu jhipster criteria için ekle
        } else if (typeof myvalues[i] === 'string') {
          params[String(mykeys[i]) + '.contains'] = myvalues[i]; // Eğer modeldeki bir key'in value'sı dolu ise onu jhipster criteria için ekle
        } else if (typeof myvalues[i].contains('date')) {
          // Ceriteriada tanımlamak lazım
          //params[String(mykeys[i])+ '.greaterThan'] =   moment(moment(myvalues[i]).format("YYYY-MM-DD HH:mm:ss")).toDate() ;
        }
      }
    }
    if (myvalues.length === 0) {
      return null;
    }
    return params;
  }
}
