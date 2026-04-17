import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Moment } from 'moment';
import dayjs from 'dayjs/esm';
import { OrderStatus } from '../pages/enumerations/order-status.model';
import { PaymentMethod } from '../pages/enumerations/payment-method.model';
import { PaymentStatus } from '../pages/enumerations/payment-status.model';
import { IOrder, NewAddress } from './interfaces';
 

export interface OrderItemDraft {
   id: number;
  quantity: number;
  basePrice: number;
  optionPrice: number;
  totalPrice: number;
  productId: number;
  productName: string;
  createdAt?: dayjs.Dayjs | null;
  options: SelectedOption[]; 
}



/*

export interface CartItem {
  uuid: string;              // frontend unique key
  productId: number;
  productName: string;

  quantity: number;

  basePrice: number;
  optionPrice: number;
  totalPrice: number;
  createdAt?:string;   
  options: SelectedOption[];
}/** */


 

export interface CartItem {
  uuid: string;

  product: CartProduct;      // ana ürün
  quantity: number;

  children?: CartChildItem[]; // alt ürünler (promo, ekstra)

  totalPrice: number;
  createdAt?: string;
  // Savaşın sonucu: Bu sipariş nereye ve nasıl gidecek?
  address: NewAddress;
    
}


export interface CartProduct {
  productId: number;
  name: string;
  basePrice: number;

  options: SelectedOption[];  // hamur, kenar vb
}

export interface CartChildItem {
  uuid: string;

  productId: number;
  name: string;

  type: 'PROMO' | 'EXTRA' | 'DRINK' | 'SAUCE';

  quantity: number;
  price: number;
}


export interface SelectedOption {
  type: 'GROUP' | 'EXTRA';
  groupId: number;
  optionId: number;
  optionName: string;
  price: number; 
  groupName?: string;  
}

export interface Address {
  id: number;
  addressId?: number | null;
  title?: string | null;
  addressText?: string | null;
  city?: string | null;
  district?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  isDefault?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  User?: Pick<User, 'id'> | null;
}

export interface User {
  id: number;
  login?: string | null;
  authorities?: Pick<Authority, 'name'>[] | null;
}

export interface Authority {
  name: string;
  isPersisted?: boolean | null;
  users?: Pick<User, 'id'>[] | null;
}


// interfaces/interfaces.ts veya ui-model.ts içine ekle
export interface IOrderExtended extends IOrder {
  items?: IOrderItemExtended[]; // Siparişin içindeki ürünler
}

export interface IOrderItemExtended {
  productId: number;
  quantity: number;
  price: number;
  options?: IOrderOption[]; // Pizzanın kenarı, sosu vb.
}

export interface IOrderOption {
  customName: string;
  quantity: number;
}

export interface OrderRequestDTO {

    id?: number;
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
    items: OrderItemDTO[];


}

export interface  OrderItemDTO {
        productId: number;
        quantity: number;
        price: string;
        options: OrderOptionDTO[];
    }

export interface OrderOptionDTO {
        customName: string;
        quantity: number;
    }
 
 

