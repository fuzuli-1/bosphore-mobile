import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  input,
  NgZone,
  OnChanges,
  OnInit,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
} from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import {
  NavController,
  ModalController,
  ToastController,
} from '@ionic/angular';

import * as iface from '../../interfaces/interfaces';
import { FooterService } from 'src/app/services/footer-service';
import { MenuService } from 'src/app/services/menu-service';
import { TranslationService } from 'src/app/services/translation-service';
import { TranslatePipe } from '../../services/TranslatePipe';
import { EntityArrayResponseType, ProductService } from './product-service';
import { combineLatest, Observable, Subscription, tap } from 'rxjs';
import { IProduct } from '../../interfaces/interfaces';
import {
  ITEMS_PER_PAGE,
  PAGE_HEADER,
  TOTAL_COUNT_RESPONSE_HEADER,
} from 'src/app/config/pagination.constants';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { SortService, SortState, sortStateSignal } from 'src/app/shared/sort';

import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
     CommonModule,
     FormsModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
  providers: [
    FooterService,
    MenuService,
    // Diğer servisler...
  ],
})
export class ProductsPage implements OnInit,OnChanges {
  
  @Input() selectedGroupItemId: number = 0;

  subscription: Subscription | null = null;
  products = signal<IProduct[]>([]);
  isLoading = false;
  sortState = sortStateSignal({});
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;
  public readonly router = inject(Router);
  protected readonly productService = inject(ProductService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(ModalController);
  protected ngZone = inject(NgZone);
  trackId = (item: IProduct): number =>
    this.productService.getProductIdentifier(item);

  constructor() {}

     ngOnChanges() {
        if (this.selectedGroupItemId) {
  
          this.subscription = combineLatest([
            this.activatedRoute.paramMap,
            this.activatedRoute.queryParamMap,
            this.activatedRoute.data
          ])
            .pipe(
              tap(([params]) => {
                const id = Number(params.get('id'));
                console.log('Route ID:', id);
              }),
              tap(() => {
                      const { page } = this;
                        this.isLoading = true;
                        const pageToLoad: number = page;
                        const queryObject: any = {
                          menuGroupItemId: this.selectedGroupItemId,
                          page: pageToLoad - 1,
                          size: this.itemsPerPage,
                          sort: this.sortService.buildSortParam(this.sortState()),
                        };
                        
                        this.productService.query(queryObject).pipe(tap(() => (this.isLoading = false))).subscribe({
                          next: (res: EntityArrayResponseType) => {
                            this.totalItems = Number(res.headers.get(TOTAL_COUNT_RESPONSE_HEADER));
                            this.products.set(res.body ?? []);
                          },
                        }); 
              })
            ).subscribe();
  
         
        }
    }


  ngOnInit(): void {
    this.subscription = combineLatest([
      this.activatedRoute.queryParamMap,
      this.activatedRoute.data,
    ])
      .pipe(
        tap(([params, data]) =>
          this.fillComponentAttributeFromRoute(params, data)
        ),
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

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(
      response.body
    );
    this.products.set(dataFromBody);
  }

  protected fillComponentAttributeFromRoute(
    params: ParamMap,
    data: Data
  ): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    this.sortState.set(
      this.sortService.parseSortParam(
        params.get(SORT) ?? data[DEFAULT_SORT_DATA]
      )
    );
  }

  protected fillComponentAttributesFromResponseBody(
    data: IProduct[] | null
  ): IProduct[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(
    headers: HttpHeaders
  ): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.productService
      .query(queryObject)
      .pipe(tap(() => (this.isLoading = false)));
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
