import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { getISOWeek } from 'date-fns';
import { CalendarModule, CalendarNativeDateFormatter } from 'angular-calendar';
@Injectable()
export class CustomDateFormatterProvider extends CalendarNativeDateFormatter {
  public override dayViewHour({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat('ca', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }

  public override weekViewTitle({ date, locale }: DateFormatterParams): string {
    const year: string | null = new DatePipe(locale!).transform(date, 'y', locale);
    const weekNumber: number = getISOWeek(date);
    return `Woche ${weekNumber} in ${year}`;
  }
  public override monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    let result = new DatePipe(locale!).transform(date, 'EEEEE', locale);
    return result ? result : '';
  }
  public override weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    let result = new DatePipe(locale!).transform(date, 'E', locale);
    return result ? result : '';
  }

  public override weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    let result = new DatePipe(locale!).transform(date, 'MM/dd', locale);
    return result ? result : '';
  }
}
