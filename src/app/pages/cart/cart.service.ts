import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs/esm';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { createRequestOption } from 'src/app/core/request/request-util';
import { isPresent } from 'src/app/core/util/operators';
import { ICart, NewCart } from 'src/app/interfaces/interfaces';
import { CartItem } from 'src/app/interfaces/ui-model';
import { CartUtils } from 'src/app/shared/utils/CartUtils';

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
  protected resourceUrl = this.applicationConfigService.getEndpointFor('/carts');
  private cart$=new BehaviorSubject<CartItem[]>(this.load());

   create(cart: NewCart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cart);
    return this.http.post<RestCart>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(cart: ICart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cart);
    return this.http
      .put<RestCart>(`${this.resourceUrl}/${this.getCartIdentifier(cart)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(cart: PartialUpdateCart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cart);
    return this.http
      .patch<RestCart>(`${this.resourceUrl}/${this.getCartIdentifier(cart)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestCart>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCart[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getCartIdentifier(cart: Pick<ICart, 'id'>): number {
    return cart.id;
  }

  compareCart(o1: Pick<ICart, 'id'> | null, o2: Pick<ICart, 'id'> | null): boolean {
    return o1 && o2 ? this.getCartIdentifier(o1) === this.getCartIdentifier(o2) : o1 === o2;
  }

  addCartToCollectionIfMissing<Type extends Pick<ICart, 'id'>>(
    cartCollection: Type[],
    ...cartsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const carts: Type[] = cartsToCheck.filter(isPresent);
    if (carts.length > 0) {
      const cartCollectionIdentifiers = cartCollection.map(cartItem => this.getCartIdentifier(cartItem));
      const cartsToAdd = carts.filter(cartItem => {
        const cartIdentifier = this.getCartIdentifier(cartItem);
        if (cartCollectionIdentifiers.includes(cartIdentifier)) {
          return false;
        }
        cartCollectionIdentifiers.push(cartIdentifier);
        return true;
      });
      return [...cartsToAdd, ...cartCollection];
    }
    return cartCollection;
  }

  protected convertDateFromClient<T extends ICart | NewCart | PartialUpdateCart>(cart: T): RestOf<T> {
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

  protected convertResponseFromServer(res: HttpResponse<RestCart>): HttpResponse<ICart> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCart[]>): HttpResponse<ICart[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }

  getCart():Observable<CartItem[]>{
    return this.cart$.asObservable();
  }

  add(item:CartItem){
    const cart=this.cart$.value;
    this.cart$.next([...cart,item]);
    this.save();
  }

   updateQuantity(uuid: string, qty: number) {
    const cart = this.cart$.value.map(i =>
      i.uuid === uuid
        ? { ...i, quantity: qty, totalPrice: (i.basePrice + i.optionPrice) * qty }
        : i
    );
    this.cart$.next(cart);
    this.save();
  }

  remove(uuid: string) {
    this.cart$.next(this.cart$.value.filter(i => i.uuid !== uuid));
    this.save();
  }

  getTotal(): number {
    return this.cart$.value.reduce((s, i) => s + i.totalPrice, 0);
  }

  private save() {
     CartUtils.saveCart(this.cart$.value)
  
  }

  private load(): CartItem[] {   
    return  CartUtils.getSafeCart()
  }
  
}
