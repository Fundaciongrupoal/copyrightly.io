import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Alert, AlertType } from './alert';

@Injectable()
export class AlertsService {

  private alertsSource = new Subject<Alert>();
  public alerts$ = this.alertsSource.asObservable();

  constructor() { }

  error(message: string) {
    this.alertsSource.next(new Alert(AlertType.danger, message));
  }

  info(message: string) {
    this.alertsSource.next(new Alert(AlertType.info, message));
  }

  success(message: string) {
    this.alertsSource.next(new Alert(AlertType.success, message));
  }

  warning(message: string) {
    this.alertsSource.next(new Alert(AlertType.warning, message));
  }
}
