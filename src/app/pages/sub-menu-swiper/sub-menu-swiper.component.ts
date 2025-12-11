 import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperDirective } from './swiper.directive';

export interface PizzaCategory {
  title: string;
  description: string;
  icon?: string;
}

@Component({
  selector: 'app-pizza-swiper',
  standalone: true,
  imports: [CommonModule, SwiperDirective],
  template: `
    <div class="pizza-category-container">
      <h2 class="section-title">Pizzalar</h2>
      
      <div class="swiper pizza-swiper" appSwiper [config]="swiperConfig">
        <div class="swiper-wrapper">
          <div class="swiper-slide" *ngFor="let category of pizzaCategories">
            <div class="category-card">
              <div class="category-icon">{{category.icon || '🍕'}}</div>
              <h3 class="category-title">{{category.title}}</h3>
              <p class="category-desc">{{category.description}}</p>
            </div>
          </div>
        </div>
        
        <!-- Navigation buttons -->
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
        
        <!-- Pagination -->
        <div class="swiper-pagination"></div>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .pizza-category-container {
      padding: 2rem 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .section-title {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #333;
      font-weight: bold;
    }
    
    .pizza-swiper {
      padding: 0 1rem;
    }
    
    .category-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: transform 0.3s ease;
      cursor: pointer;
    }
    
    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .category-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .category-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #d32f2f;
    }
    
    .category-desc {
      color: #666;
      font-size: 0.9rem;
    }
    
    /* Swiper navigation buttons */
    .swiper-button-next,
    .swiper-button-prev {
      color: #d32f2f !important;
      background: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .swiper-button-next:after,
    .swiper-button-prev:after {
      font-size: 1rem !important;
    }
    
    /* Swiper pagination */
    .swiper-pagination-bullet-active {
      background: #d32f2f !important;
    }
  `]
})
export class SubMenuSwiperComponent implements OnInit {
  pizzaCategories: PizzaCategory[] = [
    {
      title: 'Pan Pizzalar',
      description: 'Kalın hamurda lezzet şöleni',
      icon: '🍕'
    },
    {
      title: 'Cazip Pizzalar',
      description: 'Özel fiyat, özel lezzet',
      icon: '💰'
    },
    {
      title: 'Özel Pizzalar',
      description: 'Şefin özel tarifleri',
      icon: '👨‍🍳'
    },
    {
      title: 'Trend Pizzalar',
      description: 'En çok tercih edilenler',
      icon: '🔥'
    },
    {
      title: 'Bol Malzeme',
      description: 'Dopdolu malzemeli pizzalar',
      icon: '🥗'
    }
  ];

  swiperConfig = {
    slidesPerView: 1.2,
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      640: {
        slidesPerView: 2.2,
        spaceBetween: 15
      },
      768: {
        slidesPerView: 3.2,
        spaceBetween: 20
      },
      1024: {
        slidesPerView: 4.2,
        spaceBetween: 25
      }
    }
  };

  ngOnInit() {
    console.log('Categories:', this.pizzaCategories);
  }
}
  
   