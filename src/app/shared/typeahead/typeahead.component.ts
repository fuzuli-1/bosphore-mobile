import { Component, Input, Output, EventEmitter, Injectable, ViewChild, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { AlertController, IonPopover, ModalController, ToastController } from '@ionic/angular'; 
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import * as iface from '../../interfaces/interfaces'; 
import * as Leaflet from 'leaflet';
import { LoadingService } from 'src/app/services/loading-service'; 
import { FormsModule } from '@angular/forms';
 
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonRadio,
  IonRadioGroup,
  IonTextarea,
  IonDatetime,
  IonRange,
  IonSegment,
  IonSegmentButton,
  IonChip,
  IonFab,
  IonFabButton,
  IonIcon,
  IonAlert,
  IonActionSheet,
  IonModal,
  IonLoading,
  IonSpinner,
  IonProgressBar,
  IonSkeletonText,
  IonAccordion,
  IonAccordionGroup,
  IonBackButton,
  IonRouterLink,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonMenu,
  IonMenuButton,
  IonSplitPane,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSearchbar,
  IonToggle,
  IonNote,
  IonBadge,
  IonAvatar,
  IonThumbnail,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonReorder,
  IonReorderGroup,
  IonFooter,
  IonButtons,
} from '@ionic/angular/standalone';
import { TranslationService } from '../../services/translation-service';
import { TranslatePipe } from "../../services/TranslatePipe";
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
export interface OverlayEventDetail<T = any> {
  data?: T;
  role?: string;
}
@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  standalone: true,
  styleUrls: ['./typeahead.component.scss'],
  imports: [
    IonicModule,
    FormsModule,
    BrowserModule,
    TranslatePipe
],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
})
export class TypeaheadComponent implements OnInit {
  @Input() items: Item[] = [];
  @Input() selectedItems: string[] = [];
  @Input() title: String = 'Select Items';
  @ViewChild('modalx', { static: true }) modalx!: IonModal;
  
  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();
  public editNew = '';
  public filteredItems: Item[] = [];
  public workingSelectedValues: string[] = [];
  isManager = false;

  isOpen: Boolean = false;
  LocationList: any = [];
  @ViewChild('popover') popover!: IonList;
  @ViewChild('modalAddressEdit') modalAddressEdit!: IonModal;
  @ViewChild('modalMap') modalMap!: IonModal;

  newLatitude = '';
  newLongitude = '';
  aramaMap = '';

  mapEdit!: Leaflet.Map;
  markersEdit: Leaflet.Marker[] = [];
  optionsEdit = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.akgun.com.tr">AKGUN</a>',
      }),
    ],
    zoom: 6,
    center: {
      lat: 51.04818455441426,
      lng: 71.45954339684882,
    },
  };
  public translateService = inject(TranslationService);
  public http = inject(HttpClient);
  public modalCtrl = inject(ModalController);
  public loadingCtrl = inject(LoadingService);
  public toastController = inject(ToastController);
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected resourceUrl = this.applicationConfigService.getEndpointFor('/languages/categories');
  private alertCtrl = inject(AlertController);
  constructor() {
   
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }



  addEditMap(addOrEditTitle: any, row: any, modalAcilsinmi: any) {
    this.modalMap.present();
  }
  addEditAddressDetail(addOrEditTitle: any, row: any, modalAcilsinmi: any) {


    this.modalAddressEdit.present();
  }
  saveMap(address: any) {

    this.modalMap.dismiss();
  }
  applyFilterMap() {

  }
  locationSelect(loca: any) {
 
    this.initMarkersEdit(loca.display_name);
    this.isOpen = false;
  }
  initMarkersEdit(name: any) {
    for (var i = 0; i < this.markersEdit.length; i++) {
      this.mapEdit.removeLayer(this.markersEdit[i]);
    }
    this.markersEdit = [];

    let initialMarkers: any = [];
    let position: any = { position: { lat: '51.04818455441426', lng: '71.45954339684882' }, draggable: true };


    }

  
  }







export interface Item {
  text: string;
  value: string;
}
 