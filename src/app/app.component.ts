import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ApplicationConfigService } from './core/config/application-config.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { TrackerService } from './core/tracker/tracker.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { registerLocaleData } from '@angular/common';
import locale from '@angular/common/locales/tr';
import { fontAwesomeIcons } from './config/font-awesome-icons';
import dayjs from 'dayjs/esm';
 
import { GeneralSettings } from './page';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly iconLibrary = inject(FaIconLibrary);
  private readonly trackerService = inject(TrackerService);
   
  private readonly dpConfig = inject(BsDatepickerConfig);

  constructor() {
    //this.trackerService.setup();
    this.applicationConfigService.setEndpointPrefix(GeneralSettings.url);
    registerLocaleData(locale);
    this.iconLibrary.addIcons(...fontAwesomeIcons);
        // ✔️ Artık datepicker config ayarlayabilirsin:
this.dpConfig.minDate = new Date(
  dayjs().subtract(100, 'year').year(),
  0, // Ocak
  1  // Birinci gün
);

  }

 
}
