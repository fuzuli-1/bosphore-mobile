import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';
import { IOptionGroup, IOptionGroupWithItems, NewOptionGroup } from 'src/app/interfaces/interfaces';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { isPresent } from 'src/app/core/util/operators';
import { createRequestOption } from 'src/app/core/request/request-util';



export type PartialUpdateOptionGroup = Partial<IOptionGroup> & Pick<IOptionGroup, 'id'>;

type RestOf<T extends IOptionGroup | NewOptionGroup> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestOptionGroup = RestOf<IOptionGroup>;

export type NewRestOptionGroup = RestOf<NewOptionGroup>;

export type PartialUpdateRestOptionGroup = RestOf<PartialUpdateOptionGroup>;

export type EntityResponseType = HttpResponse<IOptionGroup>;
export type EntityArrayResponseType = HttpResponse<IOptionGroup[]>;
export type IOptionGroupWithItemsResponseType=HttpResponse<IOptionGroupWithItems[]>;

@Injectable({ providedIn: 'root' })
export class OptionGroupService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('/api/option-groups/getRecords');

  create(optionGroup: NewOptionGroup): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(optionGroup);
    return this.http
      .post<RestOptionGroup>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(optionGroup: IOptionGroup): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(optionGroup);
    return this.http
      .put<RestOptionGroup>(`${this.resourceUrl}/${this.getOptionGroupIdentifier(optionGroup)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(optionGroup: PartialUpdateOptionGroup): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(optionGroup);
    return this.http
      .patch<RestOptionGroup>(`${this.resourceUrl}/${this.getOptionGroupIdentifier(optionGroup)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestOptionGroup>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOptionGroup[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  
  queryWithItems(req?: any): Observable<IOptionGroupWithItemsResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IOptionGroupWithItems[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getOptionGroupIdentifier(optionGroup: Pick<IOptionGroup, 'id'>): number {
    return optionGroup.id;
  }

  compareOptionGroup(o1: Pick<IOptionGroup, 'id'> | null, o2: Pick<IOptionGroup, 'id'> | null): boolean {
    return o1 && o2 ? this.getOptionGroupIdentifier(o1) === this.getOptionGroupIdentifier(o2) : o1 === o2;
  }

  addOptionGroupToCollectionIfMissing<Type extends Pick<IOptionGroup, 'id'>>(
    optionGroupCollection: Type[],
    ...optionGroupsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const optionGroups: Type[] = optionGroupsToCheck.filter(isPresent);
    if (optionGroups.length > 0) {
      const optionGroupCollectionIdentifiers = optionGroupCollection.map(optionGroupItem => this.getOptionGroupIdentifier(optionGroupItem));
      const optionGroupsToAdd = optionGroups.filter(optionGroupItem => {
        const optionGroupIdentifier = this.getOptionGroupIdentifier(optionGroupItem);
        if (optionGroupCollectionIdentifiers.includes(optionGroupIdentifier)) {
          return false;
        }
        optionGroupCollectionIdentifiers.push(optionGroupIdentifier);
        return true;
      });
      return [...optionGroupsToAdd, ...optionGroupCollection];
    }
    return optionGroupCollection;
  }

  protected convertDateFromClient<T extends IOptionGroup | NewOptionGroup | PartialUpdateOptionGroup>(optionGroup: T): RestOf<T> {
    return {
      ...optionGroup,
      createdAt: optionGroup.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restOptionGroup: RestOptionGroup): IOptionGroup {
    return {
      ...restOptionGroup,
      createdAt: restOptionGroup.createdAt ? dayjs(restOptionGroup.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOptionGroup>): HttpResponse<IOptionGroup> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOptionGroup[]>): HttpResponse<IOptionGroup[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
