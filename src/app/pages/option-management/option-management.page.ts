import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { MenuGroupService } from '../menu-groups/menu-group-service';
import { IMenuGroup, IMenuGroupItem, IOptionGroup, IOptionItem, NewMenuGroup, NewOptionGroup } from 'src/app/interfaces/interfaces';
import { AccountService } from 'src/app/core/auth/account.service';
import { TranslationService } from 'src/app/services/translation-service';
import {
  ITEMS_PER_PAGE,
  PAGE_HEADER,
  TOTAL_COUNT_RESPONSE_HEADER,
} from 'src/app/config/pagination.constants';
import { SortService, SortState, sortStateSignal } from 'src/app/shared/sort';
import { combineLatest, Subscription, tap } from 'rxjs';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';
import { HttpResponse } from '@angular/common/http';
import { MenuGroupItemService } from '../menu-group-item/menu-group-item-service';
import { ModalController } from '@ionic/angular'; 
import { AlertController } from '@ionic/angular';
import { OptionGroupService } from '../option-group/option-group-service';
import { OptionItemService } from '../option-group-item/option-item-service';
import { OptionGroupFormComponent } from './option-group-form';
import { ItemFormComponent } from '../menu-management/item-form.component';
import { OptionItemFormComponent } from './option-item-form';

@Component({
  selector: 'app-option-management',
  templateUrl: './option-management.page.html',
  styleUrls: ['./option-management.page.scss'],
  standalone: true,
 imports: [IonicModule, CommonModule, FormsModule],
})
export class OptionManagementPage implements OnInit {

    isLoading = false;
  totalItems = 0;
  page = 1;
  itemsPerPage = ITEMS_PER_PAGE;
  sortState = sortStateSignal({});
  subscription: Subscription | null = null;
  //injects
  protected ngZone = inject(NgZone);
  private toastc = inject(ToastController);
  private optionGroupService = inject(OptionGroupService);
  private optionItemService=inject(OptionItemService);
  private account = inject(AccountService);
  private translate = inject(TranslationService);
  private modalCtrl = inject(ModalController);
  private activatedRoute = inject(ActivatedRoute);
  private sortService = inject(SortService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);
   
    newGroup:IOptionGroup={} as IOptionGroup;
    selectedGroup:IOptionGroup= {} as IOptionGroup;
    allGroups = signal<IOptionGroup[]>([]);

    optionItems =signal<IOptionItem[]>([]);
     
    selectedItem:IOptionItem={} as IOptionItem;
    selectedItemId=0;

  constructor() {
    
   }

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups(){
    this.subscription=combineLatest([
      this.activatedRoute.queryParamMap,
      this.activatedRoute.data
    ]).pipe(
        tap(([params,data])=>{
      const page=params.get(PAGE_HEADER);
      this.page=+(page??1);
      this.sortState.set(
        this.sortService.parseSortParam(
          params.get(SORT)??data[DEFAULT_SORT_DATA],
        ),
      );
    }),
    tap(()=>{
      return this.load();
    })
  ).subscribe();
  }

  load(){
      const {page}=this;
      this.isLoading=true;
      const pageToLoad:number=page;
      const queryObject:any={
        page:pageToLoad-1,
        size:this.itemsPerPage,
        sort:['id,asc']
      }

      this.optionGroupService
      .query(queryObject)
      .pipe(tap(() => (this.isLoading = false)))
      .subscribe({
        next:(res:HttpResponse<IOptionGroup[]>)=>{
          const headers=res.headers;
          this.totalItems=Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
          const groups=res.body??[];
          this.allGroups.set(groups);
          if(groups.length>0){
          //  this.loadOptionItems(groups[0].id);
              // Sayfa açılınca ilk grubu seçili yap
            this.selectGroup(groups[0]);
          }
        }
      })
  }

  onAccordionChange(event:CustomEvent){
   const data=  this.allGroups().find(item=>item.id===parseInt(event.detail.id));
   if(data){
    this.selectedGroup=data;
   }
    this.loadOptionItems(event.detail.value);
  }

 loadOptionItems(groupId:any){    
    const queryObject:any={
      groupId:groupId,
      page:0,
      size:this.itemsPerPage+50,
      sort:this.sortService.buildSortParam(this.sortState())
    };

    this.optionItemService
    .getRecords(queryObject)
    .subscribe({
      next:((res:any)=>{
        const data=res.body??[];
        this.optionItems.set(data);
        //this.selectedGroup.itemCount=data.length;

      })
    })
  }

  selectGroup(group:IOptionGroup){
    this.selectedGroup=group;
   //this.loadOptionItems(group.id);
  }

  protected handleNavigation(page:number,sortState:SortState):void{
    const queryParamsObj={
      page,
      size:this.itemsPerPage,
      sort:this.sortService.buildSortParam(sortState)

    }
    this.ngZone.run(()=>{
      this.router.navigate(['./'],{
        relativeTo:this.activatedRoute,
        queryParams:queryParamsObj,
      })
    });
  }

 async openGroupForm(group?:IOptionGroup){
    const modal=await this.modalCtrl.create({
      component:OptionGroupFormComponent,
      componentProps:{optionGroup:group||null}
    });    
    modal.onDidDismiss().then((result)=>{
      if(result.data){
         const groupData=result.data;
         if(groupData.id){
           this.optionGroupService
           .update(groupData)
           .subscribe(()=>this.load());
         }else{         
           this.optionGroupService.create(groupData)
           .subscribe(()=>{
            this.load();
           });
         }
      }
    })
     return await modal.present();
  }

  async addOptionItem(item?:IOptionItem){
    const groupId=this.selectedGroup.id;
     const modal=await this.modalCtrl.create({
      component:OptionItemFormComponent,
      componentProps:{
        item:null,
        groupId:groupId
      }
     });

     modal.onDidDismiss().then((result)=>{
      debugger;
        if(result.data){
          const itemData=result.data;
          if(itemData.id){            
            this.optionItemService.update(itemData)
            .subscribe(()=>{
              this.loadOptionItems(groupId);
            })
          }else{            
              this.optionItemService.create(itemData)
                 .subscribe(() => this.loadOptionItems(this.selectedGroup.id));
          }
        }
     });
     return await modal.present();
  }

  deleteItem(item:any){
    this.alertCtrl.create({
      header: 'Öğeyi Sil',
       message: 'Bu öğeyi silmek istediğinize emin misiniz?',  
       buttons:[
         { text: 'İptal', role: 'cancel' },
         {  text: 'Sil', role: 'destructive',handler:()=>{
             this.optionItemService.delete(item.id)
             .subscribe({
              next:(res=>{
                  this.showToast('Grup başarıyla silindi!', 'bottom');
                  this.loadOptionItems(this.selectedGroup.id);
              }),
              error:(err=>{
                this.showToast(err.detail,'bottom');
              })
             })
         } },
       ]
    }).then(alert=>alert.present());
  }

  editItem(item:any){
    this.addOptionItem(item);
  }

  editGroup(group:any){
    this.openGroupForm(group);
  }

  deleteGroup(group:any){
    this.alertCtrl.create({
      header:'Grubu Sil',
      message:'Bu grubu silmek istediginizden emin misiniz',
      buttons:[
        {text:'Iptal',role:'cancel'},
        {text:'Sil',role:'destructive',
          handler:()=>{
            this.optionGroupService.delete(group.id).subscribe({
              next:()=>{
                this.showToast('Grup basari ile silindi!.','bottom');
                this.load();
              },
              error:(res)=>{
                console.error(res.error.detail);
                this.showToast('Silme islemi basarisiz!','bottom');
              }
            })
          }
        }
      ]
    }).then((alert=>{
      return alert.present();
    }));
  }

  saveOptionGroup(){
    const nop:NewOptionGroup={
      ...this.newGroup,
      id:null,
    };
    this.optionGroupService.create(nop).subscribe((res)=>{
      this.showToast('Group basari ile silindi!.','bottom');
      this.load();
    })
  }

 async showToast(msg: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastc.create({
      message: msg,
      duration: 2500,
      cssClass: 'custom-toast-success',
      icon: 'checkmark-done-outline',
      position: position,
    });
    await toast.present();
  }

  EMOJI_MAP:Record<number,string>={
          1: '🍎',//elma
      2: '🍐',//armut
      3: '🍌',//muz
      4: '🍔',
      5: '🍕',
      6: '🥪' 
  }

  getEmoji(index:number){
      if (!index) return '🍽️';
  return this.EMOJI_MAP[index] ?? '🍽️';
  }
}
