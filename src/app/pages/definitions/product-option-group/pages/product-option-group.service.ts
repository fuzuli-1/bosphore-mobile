import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProductOptionGroup, NewProductOptionGroup } from 'src/app/interfaces/interfaces';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { createRequestOption } from 'src/app/core/request/request-util';
import { isPresent } from 'src/app/core/util/operators';

 

export type PartialUpdateProductOptionGroup = Partial<IProductOptionGroup> & Pick<IProductOptionGroup, 'id'>;

export type EntityResponseType = HttpResponse<IProductOptionGroup>;
export type EntityArrayResponseType = HttpResponse<IProductOptionGroup[]>;

@Injectable({ providedIn: 'root' })
export class ProductOptionGroupService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('/api/product-option-groups');

  create(productOptionGroup: NewProductOptionGroup): Observable<EntityResponseType> {
    return this.http.post<IProductOptionGroup>(this.resourceUrl, productOptionGroup, { observe: 'response' });
  }

  update(p0: number, payload: { productId: number; optionGroupId: number; }, productOptionGroup: IProductOptionGroup): Observable<EntityResponseType> {
    return this.http.put<IProductOptionGroup>(
      `${this.resourceUrl}/${this.getProductOptionGroupIdentifier(productOptionGroup)}`,
      productOptionGroup,
      { observe: 'response' },
    );
  }

  partialUpdate(productOptionGroup: PartialUpdateProductOptionGroup): Observable<EntityResponseType> {
    return this.http.patch<IProductOptionGroup>(
      `${this.resourceUrl}/${this.getProductOptionGroupIdentifier(productOptionGroup)}`,
      productOptionGroup,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IProductOptionGroup>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProductOptionGroup[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getProductOptionGroupIdentifier(productOptionGroup: Pick<IProductOptionGroup, 'id'>): number {
    return productOptionGroup.id;
  }

  compareProductOptionGroup(o1: Pick<IProductOptionGroup, 'id'> | null, o2: Pick<IProductOptionGroup, 'id'> | null): boolean {
    return o1 && o2 ? this.getProductOptionGroupIdentifier(o1) === this.getProductOptionGroupIdentifier(o2) : o1 === o2;
  }

  addProductOptionGroupToCollectionIfMissing<Type extends Pick<IProductOptionGroup, 'id'>>(
    productOptionGroupCollection: Type[],
    ...productOptionGroupsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const productOptionGroups: Type[] = productOptionGroupsToCheck.filter(isPresent);
    if (productOptionGroups.length > 0) {
      const productOptionGroupCollectionIdentifiers = productOptionGroupCollection.map(productOptionGroupItem =>
        this.getProductOptionGroupIdentifier(productOptionGroupItem),
      );
      const productOptionGroupsToAdd = productOptionGroups.filter(productOptionGroupItem => {
        const productOptionGroupIdentifier = this.getProductOptionGroupIdentifier(productOptionGroupItem);
        if (productOptionGroupCollectionIdentifiers.includes(productOptionGroupIdentifier)) {
          return false;
        }
        productOptionGroupCollectionIdentifiers.push(productOptionGroupIdentifier);
        return true;
      });
      return [...productOptionGroupsToAdd, ...productOptionGroupCollection];
    }
    return productOptionGroupCollection;
  }
}
