import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';
import { IProductVariation, NewProductVariation } from 'src/app/interfaces/interfaces';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { isPresent } from 'src/app/core/util/operators';
import { createRequestOption } from 'src/app/core/request/request-util';

 

export type PartialUpdateProductVariation = Partial<IProductVariation> & Pick<IProductVariation, 'id'>;

type RestOf<T extends IProductVariation | NewProductVariation> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestProductVariation = RestOf<IProductVariation>;

export type NewRestProductVariation = RestOf<NewProductVariation>;

export type PartialUpdateRestProductVariation = RestOf<PartialUpdateProductVariation>;

export type EntityResponseType = HttpResponse<IProductVariation>;
export type EntityArrayResponseType = HttpResponse<IProductVariation[]>;

@Injectable({ providedIn: 'root' })
export class ProductVariationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/product-variations');

  create(productVariation: NewProductVariation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(productVariation);
    return this.http
      .post<RestProductVariation>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(productVariation: IProductVariation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(productVariation);
    return this.http
      .put<RestProductVariation>(`${this.resourceUrl}/${this.getProductVariationIdentifier(productVariation)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(productVariation: PartialUpdateProductVariation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(productVariation);
    return this.http
      .patch<RestProductVariation>(`${this.resourceUrl}/${this.getProductVariationIdentifier(productVariation)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestProductVariation>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestProductVariation[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getProductVariationIdentifier(productVariation: Pick<IProductVariation, 'id'>): number {
    return productVariation.id;
  }

  compareProductVariation(o1: Pick<IProductVariation, 'id'> | null, o2: Pick<IProductVariation, 'id'> | null): boolean {
    return o1 && o2 ? this.getProductVariationIdentifier(o1) === this.getProductVariationIdentifier(o2) : o1 === o2;
  }

  addProductVariationToCollectionIfMissing<Type extends Pick<IProductVariation, 'id'>>(
    productVariationCollection: Type[],
    ...productVariationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const productVariations: Type[] = productVariationsToCheck.filter(isPresent);
    if (productVariations.length > 0) {
      const productVariationCollectionIdentifiers = productVariationCollection.map(productVariationItem =>
        this.getProductVariationIdentifier(productVariationItem),
      );
      const productVariationsToAdd = productVariations.filter(productVariationItem => {
        const productVariationIdentifier = this.getProductVariationIdentifier(productVariationItem);
        if (productVariationCollectionIdentifiers.includes(productVariationIdentifier)) {
          return false;
        }
        productVariationCollectionIdentifiers.push(productVariationIdentifier);
        return true;
      });
      return [...productVariationsToAdd, ...productVariationCollection];
    }
    return productVariationCollection;
  }

  protected convertDateFromClient<T extends IProductVariation | NewProductVariation | PartialUpdateProductVariation>(
    productVariation: T,
  ): RestOf<T> {
    return {
      ...productVariation,
      createdAt: productVariation.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restProductVariation: RestProductVariation): IProductVariation {
    return {
      ...restProductVariation,
      createdAt: restProductVariation.createdAt ? dayjs(restProductVariation.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestProductVariation>): HttpResponse<IProductVariation> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestProductVariation[]>): HttpResponse<IProductVariation[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
