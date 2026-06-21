import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs/esm';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { createRequestOption } from 'src/app/core/request/request-util';
import { isPresent } from 'src/app/core/util/operators';
import {CartItem, ICart, IOptionItem, NewCart } from 'src/app/interfaces/interfaces';
 
import { CartUtils } from 'src/app/shared/utils/CartUtils';
 
import { IProduct } from 'src/app/interfaces/interfaces';
import { NavController, ToastController } from '@ionic/angular';
import { NewAddress } from 'src/app/interfaces/interfaces';
import { OrderService } from 'src/app/services/order-service';
import { AppUtil } from 'src/app/shared/utils/app-util';
/* -----------------------------
   JHIPSTER TYPES (DEĞİŞMEDİ)
-------------------------------- */
export type PartialUpdateCart = Partial<ICart> & Pick<ICart, 'id'>;

type RestOf<T extends ICart | NewCart> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestCart = RestOf<ICart>;
export type NewRestCart = RestOf<NewCart>;
export type PartialUpdateRestCart = RestOf<PartialUpdateCart>;

export type EntityResponseType = HttpResponse<ICart>;
export type EntityArrayResponseType = HttpResponse<ICart[]>;

@Injectable({
  providedIn: 'root',
})
export class CartService {

  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected resourceUrl =
    this.applicationConfigService.getEndpointFor('/api/carts');

  /* --------------------------------
     LOCAL CART STATE
  ---------------------------------- */
  private cart$ = new BehaviorSubject<CartItem[]>(this.load());

  /* --------------------------------
     PUBLIC OBSERVABLE
  ---------------------------------- */
getCart(): Observable<CartItem[]> {
  return this.cart$.pipe(
    map(cart => Array.isArray(cart) ? cart : [])
  );
}


  /* --------------------------------
     CART OPERATIONS
  ---------------------------------- */

add(item: CartItem) {
  const currentCart = this.cart$.value;

  // Sepette tamamen aynı ürün ID'sine ve AYNI seçilmiş alt opsiyonlara sahip ürün var mı?
  const existingItemIndex = currentCart.findIndex(cartItem => 
    cartItem.product.id === item.product.id && 
    this.areOptionsEqual(cartItem.children, item.children)
  );

  if (existingItemIndex > -1) {
    // Varsa: Sadece miktarını artır ve yeniden hesapla
    const updatedCart = [...currentCart];
    const existingItem = updatedCart[existingItemIndex];
    
    updatedCart[existingItemIndex] = this.recalculateItem({
      ...existingItem,
      quantity: (existingItem.quantity ?? 1) + (item.quantity ?? 1)
    });
    
    this.cart$.next(updatedCart);
  } else {
    // Yoksa veya opsiyonlar farklıysa: Yeni bir UUID ile sepete yeni satır olarak ekle
    const newItem = { ...item, uuid: item.uuid || AppUtil.generateUUID() };
    this.cart$.next([...currentCart, this.recalculateItem(newItem)]);
  }
  
  this.save();
}

// Opsiyonların aynı olup olmadığını kontrol eden yardımcı metot
private areOptionsEqual(opts1?: any[], opts2?: any[]): boolean {
  if (!opts1 && !opts2) return true;
  if (!opts1 || !opts2) return false;
  if (opts1.length !== opts2.length) return false;

  // ID'ye veya koda göre sıralayıp karşılaştırma yapıyoruz
  const ids1 = opts1.map(o => o.id).sort();
  const ids2 = opts2.map(o => o.id).sort();
  
  return ids1.every((id, index) => id === ids2[index]);
}

  updateQuantity(uuid: string, quantity: number) {
    const cart = this.cart$.value.map(item =>
      item.uuid === uuid
        ? this.recalculateItem({ ...item, quantity })
        : item
    );

    this.cart$.next(cart);
    this.save();
  }

  remove(uuid: string) {
    this.cart$.next(this.cart$.value.filter(i => i.uuid !== uuid));
    this.save();
  }

  clear() {
    this.cart$.next([]);
    CartUtils.clearCart();
  }

  /* --------------------------------
     CHILD ITEMS
  ---------------------------------- */

  addChildren(uuid: string, children: IOptionItem[]) {
    const cart = this.cart$.value.map(item => {
      if (item.uuid !== uuid) return item;

      return this.recalculateItem({
        ...item,
        children: [...(item.children ?? []), ...children]
      });
    });

    this.cart$.next(cart);
    this.save();
  }

  removeChild(uuid: string, childUuid: string) {
    const cart = this.cart$.value.map(item => {
      if (item.uuid !== uuid) return item;

      return this.recalculateItem({
        ...item,
        children: item.children?.filter(c => c.uuid !== childUuid)
      });
    });

    this.cart$.next(cart);
    this.save();
  }

  /* --------------------------------
     TOTALS
  ---------------------------------- */

  getTotal(): number {
    return this.cart$.value.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  /* --------------------------------
     PRICE CALCULATION (TEK KAYNAK)
  ---------------------------------- */

 private recalculateItem(item: CartItem): CartItem {
  const base = item.product.price ?? 0;

  // Çocuk bileşenlerin (sos, ekstra et vb.) kendi ek ücretleri ve miktarları
  const childrenTotal =
    item.children?.reduce(
      (sum, c) => sum + (c.additionalPrice ?? 0) * (c.quantity ?? 1),
      0
    ) ?? 0;

  // TOPLAM: (Ürünün yalın fiyatı + ekstraları) * Sipariş adedi
  const productTotal = (base + childrenTotal) * (item.quantity ?? 1);

  return {
    ...item,
    totalPrice: productTotal 
  };
}

  /* --------------------------------
     STORAGE
  ---------------------------------- */

  private save() {
    CartUtils.saveCart(this.cart$.value);
  }

  private load(): CartItem[] {
    return CartUtils.getSafeCart();
  }

  /* --------------------------------
     JHIPSTER BACKEND METHODS
     (DOKUNMADIM)
  ---------------------------------- */

  create(cart: NewCart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cart);
    return this.http
      .post<RestCart>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(cart: ICart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cart);
    
    return this.http
      .put<RestCart>(
        `${this.resourceUrl}/${this.getCartIdentifier(cart)}`,
        copy,
        { observe: 'response' }
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }



  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestCart>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

      getCartIdentifier(cart: ICart): number {
        return cart.id;
      }


  /* --------------------------------
     DATE CONVERSIONS
  ---------------------------------- */

  protected convertDateFromClient<T extends ICart | NewCart | PartialUpdateCart>(
    cart: T
  ): RestOf<T> {
    return {
      ...cart,
      createdAt: cart.createdAt?.toJSON() ?? null,
      updatedAt: cart.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restCart: RestCart): ICart {
    return {
      ...restCart,
      createdAt: restCart.createdAt ? dayjs(restCart.createdAt) : undefined,
      updatedAt: restCart.updatedAt ? dayjs(restCart.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(
    res: HttpResponse<RestCart>
  ): HttpResponse<ICart> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }


  // CartService'e ekle
getCartSnapshot(): CartItem[] {
  return this.cart$.value;
}
}
