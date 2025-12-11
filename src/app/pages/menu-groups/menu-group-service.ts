import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMenuGroup, NewMenuGroup } from 'src/app/interfaces/interfaces';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { createRequestOption } from 'src/app/core/request/request-util';
import { isPresent } from 'src/app/core/util/operators';



export type PartialUpdateMenuGroup = Partial<IMenuGroup> & Pick<IMenuGroup, 'id'>;

export type EntityResponseType = HttpResponse<IMenuGroup>;
export type EntityArrayResponseType = HttpResponse<IMenuGroup[]>;

@Injectable({ providedIn: 'root' })
export class MenuGroupService {
  
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('/menu-groups');

  create(menuGroup: NewMenuGroup): Observable<EntityResponseType> {
    return this.http.post<IMenuGroup>(this.resourceUrl, menuGroup, { observe: 'response' });
  }

  update(menuGroup: IMenuGroup): Observable<EntityResponseType> {
    return this.http.put<IMenuGroup>(`${this.resourceUrl}/${this.getMenuGroupIdentifier(menuGroup)}`, menuGroup, { observe: 'response' });
  }

  partialUpdate(menuGroup: PartialUpdateMenuGroup): Observable<EntityResponseType> {
    return this.http.patch<IMenuGroup>(`${this.resourceUrl}/${this.getMenuGroupIdentifier(menuGroup)}`, menuGroup, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IMenuGroup>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IMenuGroup[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMenuGroupIdentifier(menuGroup: Pick<IMenuGroup, 'id'>): number {
    return menuGroup.id;
  }

  compareMenuGroup(o1: Pick<IMenuGroup, 'id'> | null, o2: Pick<IMenuGroup, 'id'> | null): boolean {
    return o1 && o2 ? this.getMenuGroupIdentifier(o1) === this.getMenuGroupIdentifier(o2) : o1 === o2;
  }

  addMenuGroupToCollectionIfMissing<Type extends Pick<IMenuGroup, 'id'>>(
    menuGroupCollection: Type[],
    ...menuGroupsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const menuGroups: Type[] = menuGroupsToCheck.filter(isPresent);
    if (menuGroups.length > 0) {
      const menuGroupCollectionIdentifiers = menuGroupCollection.map(menuGroupItem => this.getMenuGroupIdentifier(menuGroupItem));
      const menuGroupsToAdd = menuGroups.filter(menuGroupItem => {
        const menuGroupIdentifier = this.getMenuGroupIdentifier(menuGroupItem);
        if (menuGroupCollectionIdentifiers.includes(menuGroupIdentifier)) {
          return false;
        }
        menuGroupCollectionIdentifiers.push(menuGroupIdentifier);
        return true;
      });
      return [...menuGroupsToAdd, ...menuGroupCollection];
    }
    return menuGroupCollection;
  }
}
