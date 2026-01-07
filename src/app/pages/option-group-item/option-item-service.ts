import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';
import { IOptionItem, NewOptionItem } from 'src/app/interfaces/interfaces';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { createRequestOption } from 'src/app/core/request/request-util';
import { isPresent } from 'src/app/core/util/operators';



export type PartialUpdateOptionItem = Partial<IOptionItem> & Pick<IOptionItem, 'id'>;

type RestOf<T extends IOptionItem | NewOptionItem> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestOptionItem = RestOf<IOptionItem>;

export type NewRestOptionItem = RestOf<NewOptionItem>;

export type PartialUpdateRestOptionItem = RestOf<PartialUpdateOptionItem>;

export type EntityResponseType = HttpResponse<IOptionItem>;
export type EntityArrayResponseType = HttpResponse<IOptionItem[]>;

@Injectable({ providedIn: 'root' })
export class OptionItemService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/option-items');

  create(optionItem: NewOptionItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(optionItem);
    return this.http
      .post<RestOptionItem>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(optionItem: IOptionItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(optionItem);
    return this.http
      .put<RestOptionItem>(`${this.resourceUrl}/${this.getOptionItemIdentifier(optionItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(optionItem: PartialUpdateOptionItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(optionItem);
    return this.http
      .patch<RestOptionItem>(`${this.resourceUrl}/${this.getOptionItemIdentifier(optionItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestOptionItem>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOptionItem[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getOptionItemIdentifier(optionItem: Pick<IOptionItem, 'id'>): number {
    return optionItem.id;
  }

  compareOptionItem(o1: Pick<IOptionItem, 'id'> | null, o2: Pick<IOptionItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getOptionItemIdentifier(o1) === this.getOptionItemIdentifier(o2) : o1 === o2;
  }

  addOptionItemToCollectionIfMissing<Type extends Pick<IOptionItem, 'id'>>(
    optionItemCollection: Type[],
    ...optionItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const optionItems: Type[] = optionItemsToCheck.filter(isPresent);
    if (optionItems.length > 0) {
      const optionItemCollectionIdentifiers = optionItemCollection.map(optionItemItem => this.getOptionItemIdentifier(optionItemItem));
      const optionItemsToAdd = optionItems.filter(optionItemItem => {
        const optionItemIdentifier = this.getOptionItemIdentifier(optionItemItem);
        if (optionItemCollectionIdentifiers.includes(optionItemIdentifier)) {
          return false;
        }
        optionItemCollectionIdentifiers.push(optionItemIdentifier);
        return true;
      });
      return [...optionItemsToAdd, ...optionItemCollection];
    }
    return optionItemCollection;
  }

  protected convertDateFromClient<T extends IOptionItem | NewOptionItem | PartialUpdateOptionItem>(optionItem: T): RestOf<T> {
    return {
      ...optionItem,
      createdAt: optionItem.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restOptionItem: RestOptionItem): IOptionItem {
    return {
      ...restOptionItem,
      createdAt: restOptionItem.createdAt ? dayjs(restOptionItem.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOptionItem>): HttpResponse<IOptionItem> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOptionItem[]>): HttpResponse<IOptionItem[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
