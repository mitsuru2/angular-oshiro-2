import { Component, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent {
  @Input() title?: string;

  @Input() subTitle?: string;

  @Input() message?: string;

  constructor(private logger: NGXLogger) {
    this.logger.trace('new SplashComponent()');
  }
}
