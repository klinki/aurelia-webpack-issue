import { NotificationService } from 'aurelia-notify';

export class App {
  message = 'Hello World!';

  public constructor(protected notify: NotificationService,) {

  }

  attached() {
    this.notify.info('Just test of notifications');
  }
}
