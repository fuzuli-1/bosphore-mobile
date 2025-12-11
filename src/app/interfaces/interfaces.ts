import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Moment } from 'moment';
import dayjs from 'dayjs/esm';


export interface IMenuGroup {
  id: number;
  title?: string | null;
  orderNo?: number | null;
  iconPath?: string | null;
  targetPage?: string | null;
  language?: Pick<ILanguage, 'id'> | null;
}

export type NewMenuGroup = Omit<IMenuGroup, 'id'> & { id: null };

export interface IMenuGroupItem {
  id: number;
  label?: string | null;
  orderNo?: number | null;
  targetCategoryId?: number | null;
  targetPage?: string | null;
  iconPath?: string | null;
  translateCode?: string | null;
  menuGroup?: Pick<IMenuGroup, 'id'> | null;
}

export type NewMenuGroupItem = Omit<IMenuGroupItem, 'id'> & { id: null };

export interface AppJwtPayload {
  sub: string;
  exp: number;
  iat: number;
  auth?: string;
  userId?: number;
}

export interface ITax {
  id: number;
  taxName?: string | null;
  taxValue?: string | null;
  rowNo?: number | null;
  isActive?: boolean | null;
}

export type NewTax = Omit<ITax, 'id'> & { id: null };

export interface ICompanyBranch {
  id: number;
  serialVersionUID?: number | null;
  branchName?: string | null;
  address?: string | null;
  taxDairesiId?: number | null;
  balance?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
  cityId?: number | null;
  townId?: number | null;
  score?: string | null;
  note?: string | null;
  isActive?: boolean | null;
  passivedPersonnel?: string | null;
  passivedUserId?: number | null;
  passiveDate?: string | null;
  createdBy?: number | null;
  createdDate?: string | null;
  updatedBy?: number | null;
  updatedDate?: string | null;
  companymaster?: Pick<ICompanyMaster, 'id'> | null;
}

export type NewCompanyBranch = Omit<ICompanyBranch, 'id'> & { id: null };

export interface ICompanyMaster {
  id: number;
  serialVersionUID?: number | null;
  title?: string | null;
  cityId?: number | null;
  townId?: number | null;
  address?: string | null;
  taxNo?: string | null;
  mersisNo?: string | null;
  tradeNumber?: number | null;
  taxDairesiId?: number | null;
  adminPerson?: string | null;
  isActive?: boolean | null;
  passivedPersonnel?: string | null;
  passivedUserId?: number | null;
  passiveDate?: string | null;
  createdBy?: number | null;
  createdDate?: string | null;
  updatedBy?: number | null;
  updatedDate?: string | null;
}

export type NewCompanyMaster = Omit<ICompanyMaster, 'id'> & { id: null };


 export interface IProduct {
  id: number;
  productId?: number | null;
  name?: string | null;
  description?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  isActive?: boolean | null;
  isAvailable?: boolean | null;
  preparationTime?: number | null;
  createdAt?: dayjs.Dayjs | null;
  productCode?: string | null;
  productSellerCode?: string | null;
  productName?: string | null;
  productSellingName?: string | null;
  note?: string | null;
  unitId?: number | null;
  lastInSum?: string | null;
  wholesaleSum?: string | null;
  retailSum?: string | null;
  passivedPersonnel?: string | null;
  passivedUserId?: number | null;
  passiveDate?: string | null;
  createdBy?: number | null;
  createdDate?: string | null;
  updatedBy?: number | null;
  updatedDate?: string | null;
  tax?: Pick<ITax, 'id'> | null;
  category?: Pick<ICategory, 'id'> | null;
  language?: Pick<ILanguage, 'id'> | null;
}

export type NewProduct = Omit<IProduct, 'id'> & { id: null };

export interface ILanguage {
  id: number;
  translateCode?: string | null;
  desc?: string | null;
  tr?: string | null;
  en?: string | null;
  ru?: string | null;
  kz?: string | null;
  an?: string | null;
  isActive?: boolean | null;
  groupCode?: string | null;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
}

export type NewLanguage = Omit<ILanguage, 'id'> & { id: null };

export interface ICategory {
  id: number;
  name?: string | null;
  isActive?: boolean | null;
  categoryId?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder?: number | null;
  createdAt?: dayjs.Dayjs | null;
  icon: String;
  active: boolean;
}

export type NewCategory = Omit<ICategory, 'id'> & { id: null };