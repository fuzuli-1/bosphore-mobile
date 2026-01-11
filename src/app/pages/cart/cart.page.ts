import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderPage } from '../page-header/page-header.page';
import { CartItem, SelectedOption } from 'src/app/interfaces/ui-model';
import { CartService } from './cart.service';
import { IOptionGroupWithItems } from 'src/app/interfaces/interfaces';
import { IOptionGroupWithItemsResponseType, OptionGroupService } from '../option-group/option-group-service';
import { ITEMS_PER_PAGE, TOTAL_COUNT_RESPONSE_HEADER } from 'src/app/config/pagination.constants';
import { HttpHeaders } from '@angular/common/http';
import { ExtraOptionGroupPage } from '../options/extra-options/extra-group.page';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,PageHeaderPage,ExtraOptionGroupPage],
})
export class CartPage implements OnInit {

  page = 1;
  total = 0;
  isLoading = false;
  cartItems: CartItem[] = [];
  optionGroups = signal<IOptionGroupWithItems[]>([]);
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  productId:number=0;
  selectedOptions: SelectedOption[] = [];
  protected readonly cartService=inject(CartService);
  protected readonly optionGroupService = inject(OptionGroupService);
  protected ngZone = inject(NgZone);  


  ngOnInit() {

      this.cartService.getCart().subscribe(items => {
        this.cartItems = items;
        this.total = this.cartService.getTotal();
      });
    }



    

  increase(item: CartItem) {
      this.cartService.updateQuantity(item.uuid, item.quantity + 1);
  }

  decrease(item: CartItem) {
      if (item.quantity > 1) {
        this.cartService.updateQuantity(item.uuid, item.quantity - 1);
      }
  }

  remove(item: CartItem) {
      this.cartService.remove(item.uuid);
  }

   onExtraOptionsChange(options: SelectedOption[]) {
     this.selectedOptions = options;
        
  }

}
