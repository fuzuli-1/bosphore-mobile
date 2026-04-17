import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs/esm';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { createRequestOption } from 'src/app/core/request/request-util';
import { isPresent } from 'src/app/core/util/operators';
import { ICart, NewCart } from 'src/app/interfaces/interfaces';
import {
  CartItem,
  CartChildItem,
  SelectedOption
} from 'src/app/interfaces/ui-model';
import { CartUtils } from 'src/app/shared/utils/CartUtils';
import  {CartProduct} from 'src/app/interfaces/ui-model';
import { IProduct } from 'src/app/interfaces/interfaces';
import { NavController, ToastController } from '@ionic/angular';
import { NewAddress } from 'src/app/interfaces/interfaces';
import { OrderService } from 'src/app/services/order-service';
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
    const cart = [...this.cart$.value, this.recalculateItem(item)];
    this.cart$.next(cart);
    this.save();
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

  addChildren(uuid: string, children: CartChildItem[]) {
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
    const base = item.product.basePrice ?? 0;

    const optionTotal =
      item.product.options?.reduce(
        (sum, opt) => sum + (Number(opt.price) || 0),
        0
      ) ?? 0;

    const productTotal = (base + optionTotal) * item.quantity;

    const childrenTotal =
      item.children?.reduce(
        (sum, c) => sum + (c.price * c.quantity),
        0
      ) ?? 0;

    return {
      ...item,
      totalPrice: productTotal + childrenTotal
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
}
