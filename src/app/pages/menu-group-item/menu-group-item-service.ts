import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { isPresent } from 'src/app/core/util/operators';
import { IMenuGroupItem } from 'src/app/interfaces/interfaces';
import { createRequestOption } from '../../core/request/request-util';
export type PartialUpdateMenuGroupItem = Partial<IMenuGroupItem> & Pick<IMenuGroupItem, 'id'>;

export type EntityResponseType = HttpResponse<IMenuGroupItem>;
export type EntityArrayResponseType = HttpResponse<IMenuGroupItem[]>;

@Injectable({
  providedIn: 'root',
})
export class MenuGroupItemService {



  getMenuGroupItems(menuGroupId: number): Observable<EntityArrayResponseType> {
     const options = createRequestOption(menuGroupId);
     return this.http.get<IMenuGroupItem[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

   protected readonly http = inject(HttpClient);
   protected readonly applicationConfigService = inject(ApplicationConfigService);
   protected resourceUrl = this.applicationConfigService.getEndpointFor('/menu-group-items');



   update(menuGroupItem: IMenuGroupItem): Observable<EntityResponseType> {
    return this.http.put<IMenuGroupItem>(`${this.resourceUrl}/${this.getMenuGroupItemIdentifier(menuGroupItem)}`, menuGroupItem, {
      observe: 'response',
    });
  }

    partialUpdate(menuGroupItem: PartialUpdateMenuGroupItem): Observable<EntityResponseType> {
    return this.http.patch<IMenuGroupItem>(`${this.resourceUrl}/${this.getMenuGroupItemIdentifier(menuGroupItem)}`, menuGroupItem, {
      observe: 'response',
    });
  }

    find(id: number): Observable<EntityResponseType> {
    return this.http.get<IMenuGroupItem>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

    query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IMenuGroupItem[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

    delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }


  getMenuGroupItemIdentifier(menuGroupItem: Pick<IMenuGroupItem, 'id'>): number {
    return menuGroupItem.id;
  }

    compareMenuGroupItem(o1: Pick<IMenuGroupItem, 'id'> | null, o2: Pick<IMenuGroupItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getMenuGroupItemIdentifier(o1) === this.getMenuGroupItemIdentifier(o2) : o1 === o2;
  }

    addMenuGroupItemToCollectionIfMissing<Type extends Pick<IMenuGroupItem, 'id'>>(
    menuGroupItemCollection: Type[],
    ...menuGroupItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const menuGroupItems: Type[] = menuGroupItemsToCheck.filter(isPresent);
    if (menuGroupItems.length > 0) {
      const menuGroupItemCollectionIdentifiers = menuGroupItemCollection.map(menuGroupItemItem =>
        this.getMenuGroupItemIdentifier(menuGroupItemItem),
      );
      const menuGroupItemsToAdd = menuGroupItems.filter(menuGroupItemItem => {
        const menuGroupItemIdentifier = this.getMenuGroupItemIdentifier(menuGroupItemItem);
        if (menuGroupItemCollectionIdentifiers.includes(menuGroupItemIdentifier)) {
          return false;
        }
        menuGroupItemCollectionIdentifiers.push(menuGroupItemIdentifier);
        return true;
      });
      return [...menuGroupItemsToAdd, ...menuGroupItemCollection];
    }
    return menuGroupItemCollection;
  }
  
}
