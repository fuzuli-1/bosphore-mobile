import { Pipe, PipeTransform, inject, computed } from '@angular/core';
import { TranslationService } from '../services/translation-service';

@Pipe({
  name: 'translate',
  standalone: true,      // 🔥 Angular 15+ standalone pipe
  pure: false            // 🔥 reactive çeviri için pure=false
})
export class TranslatePipe implements PipeTransform {

  private translationService = inject(TranslationService);

  transform(value: string): string {
    return this.translationService.instant(value);
  }
 
}
