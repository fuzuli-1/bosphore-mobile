import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Moment } from 'moment';
import dayjs from 'dayjs/esm';
import { OrderStatus } from '../pages/enumerations/order-status.model';
import { PaymentMethod } from '../pages/enumerations/payment-method.model';
import { PaymentStatus } from '../pages/enumerations/payment-status.model';
import { NewAddress } from './interfaces';
 

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
 
/*
[
  {
    "uuid": "c1",
    "quantity": 2,
    "product": {
      "productId": 101,
      "name": "Küçük Boy Bol Malzemos",
      "basePrice": 345,
      "options": [
        { "code": "HAMUR", "value": "İNCE" },
        { "code": "KENAR", "value": "KLASİK" }
      ]
    },
    "children": [
      {
        "uuid": "c1-1",
        "productId": 201,
        "name": "Coca-Cola 1L",
        "type": "DRINK",
        "quantity": 2,
        "price": 140
      },
      {
        "uuid": "c1-2",
        "productId": 301,
        "name": "Çikolatalı Sufle",
        "type": "PROMO",
        "quantity": 1,
        "price": 115
      }
    ],
    "totalPrice": 690,
    "createdAt": "2026-01-14T20:30:00Z"
  }
]




/**/


