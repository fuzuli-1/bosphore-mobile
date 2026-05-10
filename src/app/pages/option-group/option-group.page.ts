import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subscription,
  tap,
} from 'rxjs';
import { IOptionGroup, IOptionGroupWithItems, IOptionItem, SelectedOption } from 'src/app/interfaces/interfaces';
import {
  ITEMS_PER_PAGE,
  PAGE_HEADER,
  TOTAL_COUNT_RESPONSE_HEADER,
} from 'src/app/config/pagination.constants';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';

import { SortService, SortState, sortStateSignal } from 'src/app/shared/sort';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { EntityArrayResponseType } from '../menu-group-item/menu-group-item-service';
import { HttpHeaders } from '@angular/common/http';
import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';
import { IOptionGroupWithItemsResponseType, OptionGroupService } from './option-group-service';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, Thumbs, Scrollbar } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';
import { Bosp } from 'src/app/shared/utils/Bosp';


// Swiper modüllerini kaydet
Swiper.use([Navigation, Pagination, Scrollbar]);

@Component({
  selector: 'app-option-group',
  templateUrl: './option-group.page.html',
  styleUrls: ['./option-group.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OptionGroupPage implements OnChanges {

  @Input() productId?: number;
  @Output() optionsChange = new EventEmitter<SelectedOption[]>();
  subscription: Subscription | null = null;
  optionGroups = signal<IOptionGroupWithItems[]>([]);
  extraGroup :IOptionGroupWithItems|null = null;
  extraOptions = signal<IOptionItem[]>([]);
  isLoading = false;
  sortState = sortStateSignal({});
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;
  bospUtil = Bosp;
  public readonly router = inject(Router);
  protected readonly optionGroupService = inject(OptionGroupService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  private modalCtrl = inject(ModalController);
  protected ngZone = inject(NgZone);

  trackId = (item: IOptionGroup): number =>
    this.optionGroupService.getOptionGroupIdentifier(item);

  constructor() {
    
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId != null) {
      this.load();
    }
  }

  load(): void {
    const { page } = this;
      this.isLoading = true; 
    this.optionGroupService.queryWithItems({
      productId: this.productId,
      optionType:1,
      page: 0,
      size: this.itemsPerPage,
    }).subscribe({
      next: (res) => {
         this.isLoading = false; 
        this.onResponseSuccess(res);
      },
      error: () => { 
        this.isLoading = false; 
      }
     });


   this.optionGroupService.queryWithItems({
      productId: this.productId,
      optionType:2,
      page: 0,
      size: 1000,
    }).subscribe({
      next: (res) => {
         this.isLoading = false; 
         const data = this.fillComponentAttributesFromResponseBody(res.body);
          this.extraGroup=data[0];
          this.extraOptions.set(data[0].items);         
      },
      error: () => { 
        this.isLoading = false; 
      }
     });

  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(this.page, event);
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState());
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

  protected onResponseSuccess(response: IOptionGroupWithItemsResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.optionGroups.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IOptionGroupWithItems[] | null): IOptionGroupWithItems[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }  
 
CARD_WIDTH = 272; // card + gap
currentIndexMap = new Map<number, number>();

getIndex(group: IOptionGroupWithItems): number {
  return this.currentIndexMap.get(group.id) ?? 0;
}

setIndex(group: IOptionGroupWithItems, value: number) {
  this.currentIndexMap.set(group.id, value);
}

next(group: IOptionGroupWithItems) {
  const index = this.getIndex(group);
  if (index < group.items.length - 1) {
    this.setIndex(group, index + 1);
  }
}

prev(group: IOptionGroupWithItems) {
  const index = this.getIndex(group);
  if (index > 0) {
    this.setIndex(group, index - 1);
  }
}

getTransform(group: IOptionGroupWithItems): string {
  return `translateX(-${this.getIndex(group) * this.CARD_WIDTH}px)`;
}

canGoLeft(group: IOptionGroupWithItems): boolean {
  return this.getIndex(group) > 0;
}

canGoRight(group: IOptionGroupWithItems): boolean {
  return this.getIndex(group) < group.items.length - 1;
}

selectItem(group: IOptionGroupWithItems, item: IOptionItem) {
  // seçili item id
  group.selectedItemId = item.id;

  // item zaten baştaysa sadece index resetle
  if (group.items[0].id === item.id) {
    this.setIndex(group, 0);
    return;
  }

  // item'ı listeden çıkar
  const index = group.items.findIndex(i => i.id === item.id);
  if (index === -1) return;

  const [selected] = group.items.splice(index, 1);

  // başa ekle
  group.items.unshift(selected);

  // carousel'i başa al
  this.setIndex(group, 0);
  this.emitSelections();
}

isSelected(group: IOptionGroupWithItems, item: IOptionItem): boolean {
  return group.selectedItemId === item.id;
}

/* */

searchText = '';

toggleExtra(item: IOptionItem) {
  item.selected = !item.selected;
   this.emitSelections();
}

removeExtra(item: IOptionItem) {
  item.selected = false;
   this.emitSelections();
}

filteredExtras(): IOptionItem[] {
  if (!this.searchText) return this.extraOptions();

  return this.extraOptions().filter(e =>
    e.name?.toLowerCase().includes(this.searchText.toLowerCase())
  );
}

emitSelections() {
  const selections: SelectedOption[] = [];

  // GROUP seçenekleri (tekli)
  this.optionGroups().forEach(group => {
    if (group.selectedItemId) {
      const item = group.items.find(i => i.id === group.selectedItemId);
      if (item) {
        selections.push({
          type: 'GROUP',
          groupId: group.id,
          groupName: Bosp.valueFrom(group,"name"),
          optionId: item.id,
          optionName:Bosp.valueFrom(item,"name"),  
          price: item.additionalPrice ?? 0,
        });
      }
    }
  });


  // EXTRA seçenekler (çoklu)
  this.extraOptions()
    .filter(e => e.selected)
    .forEach(item => {
      selections.push({
        type: 'EXTRA',
        groupId:Bosp.getValue(this.extraGroup,"name"),
        groupName: Bosp.valueFrom(this.extraGroup,"name"),
        optionId: item.id,
        optionName:Bosp.valueFrom(item,"name"),  
        price: item.additionalPrice ?? 0,
      });
    });

  this.optionsChange.emit(selections);
}

 
}
