import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Moment } from 'moment';
import dayjs from 'dayjs/esm';
import { OrderStatus } from '../pages/enumerations/order-status.model';
import { PaymentMethod } from '../pages/enumerations/payment-method.model';
import { PaymentStatus } from '../pages/enumerations/payment-status.model';
 

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


export interface SelectedOption {
  type: 'GROUP' | 'EXTRA';
  groupId: number;
  optionId: number;
  optionName: string;
  price: number; 
  groupName?: string;  
}


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
}


