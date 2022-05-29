import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-enter',
  templateUrl: './enter.component.html',
  styleUrls: ['./enter.component.scss'],
})
export class EnterComponent {
  @Input() title?: string;

  @Output() enterEvent = new EventEmitter<boolean>();

  constructor(private logger: NGXLogger) {
    this.logger.trace('new EnterComponent()');
  }

  enter() {
    this.logger.info('Enter button is pressed.');
    this.enterEvent.emit(true);
  }
}
