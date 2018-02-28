import { autoinject } from 'aurelia-framework';
import { NotificationService } from 'aurelia-notify';

@autoinject()
export class App {
  message = 'Hello World!';

  public constructor(protected notify: NotificationService,) {

  }

  attached() {
    this.notify.info('Just test of notifications');
  }
}
