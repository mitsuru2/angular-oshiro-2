import { Component, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-enter',
  templateUrl: './enter.component.html',
  styleUrls: ['./enter.component.scss'],
})
export class EnterComponent {
  @Input() title?: string;

  constructor(private logger: NGXLogger) {
    this.logger.trace('new EnterComponent()');
  }
}
