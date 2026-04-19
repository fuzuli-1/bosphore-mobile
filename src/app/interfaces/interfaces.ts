import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Moment } from 'moment';
import dayjs from 'dayjs/esm';
import { OrderStatus } from '../pages/enumerations/order-status.model';
import { PaymentMethod } from '../pages/enumerations/payment-method.model';
import { PaymentStatus } from '../pages/enumerations/payment-status.model';

export interface IMenuGroup {
  id: number;
  title?: string | null;
  orderNo?: number | null;
  iconPath?: string | null;
  targetPage?: string | null;
  language?: Pick<ILanguage, 'id'> | null;
  items?:IMenuGroupItem[]|null,
  itemCount:number;
}
export type NewMenuGroup = Omit<IMenuGroup, 'id'> & { id: null };

export interface IMenuGroupItem {
  id: number;
  label?: string | null;
  orderNo?: number | null;
  targetCategoryId: number;
  targetPage?: string | null;
  iconPath?: string | null;
  language?: Pick<ILanguage, 'id'> | null;
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
  price?: number | null;
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
  lastInSum?: number | null;
  wholesaleSum?: number | null;
  retailSum?: number | null;
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
  reviewCount?: number|0;
  rating?: number|0;
  badge?: string | null;
  emoji?: any|null;
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
  menuGroupItem?:IMenuGroupItem  | null;
}
export type NewCategory = Omit<ICategory, 'id'> & { id: null };

export interface IPersonnel {
  id: number;
  userId?: number | null;
  email?: string | null;
  passwordHash?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  createdAt?: dayjs.Dayjs | null;
  isActive?: boolean | null;
  isAppUser?: boolean | null;
  title?: string | null;
  login?: string | null;
  passwordDate?: string | null;
  passwordPeriod?: number | null;
  isChangePass?: boolean | null;
  isLimitedSession?: boolean | null;
  lastSessionDate?: string | null;
  sessionCount?: number | null;
  wrongPassCount?: number | null;
  notifyToken?: string | null;
  identityNo?: string | null;
  personType?: number | null;
  isOther?: boolean | null;
  otherNote?: string | null;
  authGroupId?: number | null;
  phoneNumber?: string | null;
  pictureId?: number | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  gender?: string | null;
  documentTypeId?: number | null;
  isWorking?: boolean | null;
  branchCode?: string | null;
  isVibration?: boolean | null;
  isSound?: boolean | null;
  isNotify?: boolean | null;
  isCanAllPatients?: boolean | null;
  isManager?: boolean | null;
  isDriver?: boolean | null;
  isDoctor?: boolean | null;
  specializationId?: number | null;
  passivedBy?: string | null;
  passivedDate?: string | null;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
}
export type NewPersonnel = Omit<IPersonnel, 'id'> & { id: null };

export interface IOrder {
  id: number;
  orderId?: number | null;
  orderDate?: dayjs.Dayjs | null;
  totalAmount?: number | null;
  status?: keyof typeof OrderStatus | null;
  
  paymentMethod?: keyof typeof PaymentMethod | null;
  paymentStatus?: keyof typeof PaymentStatus | null;
  estimatedDeliveryTime?: dayjs.Dayjs | null;
  actualDeliveryTime?: dayjs.Dayjs | null;
  notes?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  customerName?: string | null;
  customerAddress?: string | null;
  customerPhone?: string | null;
  personnel?: IPersonnel | null;
  orderItems?: IOrderItem[] | null;
}
export type NewOrder = Omit<IOrder, 'id'> & { id: null };

export interface IOrderItem {
  id: number;
  orderItemId?: number | null;
  quantity?: number | null;
  price?: number | null;
  note?: string | null;
  createdAt?: dayjs.Dayjs | null;
  product?: IProduct | null;
  order?: Pick<IOrder, 'id'> | null;
  options?: IOptionItem[] | null;
}
export type NewOrderItem = Omit<IOrderItem, 'id'> & { id: null };

export interface IOptionGroup {
  id: number;
  name?: string | null;
  minSelect?: number | null;
  maxSelect?: number | null;
  isActive?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  requiredGroup?: boolean | null;
  product?: Pick<IProduct, 'id'> | null;
  language?: Pick<ILanguage, 'id'> | null;
}
export type NewOptionGroup = Omit<IOptionGroup, 'id'> & { id: null };

export interface IOptionItem {
  id: number;
  name?: string | null;
  additionalPrice?: number | null;
  isActive?: boolean | null;
  isDefault?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  optionGroup?: Pick<IOptionGroup, 'id'> | null;
  language?: Pick<ILanguage, 'id'> | null;
  imageUrl?: string | null;
  selected?: boolean | null;
  selectedItemId?: number;
}
export type NewOptionItem = Omit<IOptionItem, 'id'> & { id: null };

export interface IOptionGroupWithItems extends IOptionGroup {
  selectedItemId?: number;
  selected?: boolean | null;
  items: IOptionItem[];
}

export interface ICart {
  id: number;
  cartId?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}
export type NewCart = Omit<ICart, 'id'> & { id: null };

export interface IAddress {
  id: number;
  addressId?: number | null;
  title?: string | null;
  addressText?: string | null;

  buildingNo?: string | null;
  floorAndApartment?: string | null;
  description?: string | null;
  city?: string | null;
  district?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  isDefault?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  IUser?: Pick<IUser, 'id'> | null;
}
export type NewAddress = Omit<IAddress, 'id'> & { id: null };

export class Address implements IAddress {
  id = 0;
  street = '';
  city = '';
  country = '';
}

export interface IAuthority {
  name: string;
  isPersisted?: boolean | null;
  users?: Pick<IUser, 'id'>[] | null;
}

export type NewAuthority = Omit<IAuthority, 'name'> & { name: null };

export interface IUser {
  id: number;
  login?: string | null;
  authorities?: Pick<IAuthority, 'name'>[] | null;
}


