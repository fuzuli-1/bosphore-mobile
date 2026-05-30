import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, NgZone, OnInit, Output, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from 'src/app/services/translation-service';
import { FooterService } from 'src/app/services/footer-service';
import { LoadingService } from 'src/app/services/loading-service';
 import { NavController, ModalController, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { IMenuGroup } from 'src/app/interfaces/interfaces';
import { EntityArrayResponseType, MenuGroupService } from './menu-group-service';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'src/app/config/pagination.constants';
import { DEFAULT_SORT_DATA,SORT } from 'src/app/config/navigation.constants';
import {SortService, type SortState, sortStateSignal }  from 'src/app/shared/sort';
 import * as iface from '../../interfaces/interfaces';
import Swiper from 'swiper';

@Component({
  selector: 'app-menu-groups',
  templateUrl: './menu-groups.page.html',
  styleUrls: ['./menu-groups.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MenuGroupsPage implements OnInit {

  spaceBetween = 10;
@Output() selectedGroupChange = new EventEmitter<iface.IMenuGroup>();
 selected: iface.IMenuGroup | null = null;

 private translateService = inject(TranslationService);
   
  private footerService = inject(FooterService);
  private loadingCtrl = inject(LoadingService);
  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private sanitizer = inject(DomSanitizer);
  protected readonly sortService = inject(SortService);
  private modalService = inject(ModalController);

  private toastController = inject(ToastController);

  subscription: Subscription | null = null;
  menuGroups = signal<IMenuGroup[]>([]);
  isLoading = false;
  selectedSegment!: number;
  sortState = sortStateSignal({});

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;
  
  protected readonly menuGroupService = inject(MenuGroupService);
  protected readonly activatedRoute = inject(ActivatedRoute);
 
  protected ngZone = inject(NgZone);

  trackId = (item: IMenuGroup): number => this.menuGroupService.getMenuGroupIdentifier(item);

    onProgress(event: CustomEvent<[Swiper, number]>) {
    const [swiper, progress] = event.detail;
    console.log(progress);
  }

  onSlideChange() {
    console.log('slide changed');
  }
  
  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
         this.selectedSegment=1;
      },
    });
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
    return this.menuGroupService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.menuGroups.set(dataFromBody);
      if(dataFromBody.length>0){
         this.selectedGroupChange.emit(dataFromBody[0]);        
      }
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
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

    protected fillComponentAttributesFromResponseBody(data: IMenuGroup[] | null): IMenuGroup[] {
    return data ?? [];
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

    async presentToast(type: any, position: 'top' | 'middle' | 'bottom', mesaj: string) {
    //type 1 success , 0   error
        const toast = await this.toastController.create({
          message: mesaj,
          duration: 2500,
          cssClass: 'custom-toast-success',
          icon: 'checkmark-done-outline',
          position: position,
        });

        const toast0 = await this.toastController.create({
          message: mesaj,
          duration: 2500,
          cssClass: 'custom-toast-warning',
          icon: 'information-outline',
          position: position,
        });

        if (type === 1) {
          await toast.present();
        }
  }

  selectMenuGroup(menuGroup: IMenuGroup) {
      this.selected=menuGroup;
      this.selectedGroupChange.emit(menuGroup);
  }
}
