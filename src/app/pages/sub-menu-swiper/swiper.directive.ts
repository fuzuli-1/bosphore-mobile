import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';
import Swiper from 'swiper';

@Directive({
  selector: '[appSwiper]',
  standalone: true
})
export class SwiperDirective implements AfterViewInit, OnDestroy {
  @Input() config: any = {};
  private swiper: Swiper | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.swiper = new Swiper(this.el.nativeElement, this.config);
    });
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
}