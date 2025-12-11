 
 import { Component, inject, Input, NgZone, OnChanges, OnInit, signal } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
 import * as iface from '../../interfaces/interfaces';
import { combineLatest, Observable, Subscription, tap } from 'rxjs';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'src/app/config/pagination.constants';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { MenuGroupItemService } from './menu-group-item-service';
import { SortService } from 'src/app/shared/sort/sort.service';
import { NavController,ModalController,ToastController,RefresherEventDetail,} from '@ionic/angular';
import { EntityArrayResponseType } from '../menu-groups/menu-group-service';
import { SortState, sortStateSignal } from 'src/app/shared/sort';
import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';
import { HttpHeaders } from '@angular/common/http';
 

@Component({
  selector: 'app-category-swiper-component',
  templateUrl: './category-swiper-component.component.html',
  styleUrls: ['./category-swiper-component.component.scss'],
  standalone: true,
  imports: [], 
   schemas: [CUSTOM_ELEMENTS_SCHEMA]  // özel elementlere izin için
   
 
})
export class CategorySwiperComponent implements OnInit ,OnChanges{
   subscription: Subscription | null = null;
   menuGroupItems = signal<iface.IMenuGroupItem[]>([]);
   isLoading = false;
   sortState = sortStateSignal({});
   itemsPerPage = ITEMS_PER_PAGE;
   totalItems = 0;
   page = 1;
    @Input() menuGroupId: number = 2;
    public readonly router = inject(Router);
    protected readonly menuGroupItemService = inject(MenuGroupItemService);
    protected readonly activatedRoute = inject(ActivatedRoute);
    protected readonly sortService = inject(SortService);
    protected modalService = inject(ModalController);
    protected ngZone = inject(NgZone);
    trackId = (item: iface.IMenuGroupItem): number => this.menuGroupItemService.getMenuGroupItemIdentifier(item);
    
     ngOnChanges() {
      if (this.menuGroupId) {

        this.subscription = combineLatest([
          this.activatedRoute.paramMap,
          this.activatedRoute.queryParamMap,
          this.activatedRoute.data
        ])
          .pipe(
            tap(([params]) => {
              const id = Number(params.get('id'));
              console.log('Route ID:', id);

              // input yerine route id kullanabilirsin
              //this.menuGroupId = id;
            }),
            tap(() => {
                    const { page } = this;
                      this.isLoading = true;
                      const pageToLoad: number = page;
                      const queryObject: any = {
                        menuGroupId: this.menuGroupId,
                        page: pageToLoad - 1,
                        size: this.itemsPerPage,
                        sort: this.sortService.buildSortParam(this.sortState()),
                      };
                      
                      this.menuGroupItemService.query(queryObject).pipe(tap(() => (this.isLoading = false))).subscribe({
                        next: (res: EntityArrayResponseType) => {
                          this.totalItems = Number(res.headers.get(TOTAL_COUNT_RESPONSE_HEADER));
                          this.menuGroupItems.set(res.body ?? []);
                        },
                      }); 
            })
          ).subscribe();

       
      }
  }

 ngOnInit() {
  this.subscription = combineLatest([
    this.activatedRoute.paramMap,
    this.activatedRoute.queryParamMap,
    this.activatedRoute.data
  ])
    .pipe(
      tap(([params]) => {
        const id = Number(params.get('id'));
        console.log('Route ID:', id);

        // input yerine route id kullanabilirsin
        //this.menuGroupId = id;
      }),
      tap(() => this.load())
    )
    .subscribe();
}




    load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

    navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(this.page, event);
  }

    navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState());
  }
 
   protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.menuGroupItems.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: iface.IMenuGroupItem[] | null): iface.IMenuGroupItem[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }
  
    protected queryBackend(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      menuGroupId: this.menuGroupId,
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.menuGroupItemService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

    protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  } 
}
 
 
