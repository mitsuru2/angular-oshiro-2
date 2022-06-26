import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
})
export class TopMenuComponent implements OnInit {
  @Input() title!: string;

  @Input() subTitle?: string;

  @Input() isSignedIn!: boolean;

  @Output() toggleSideMenuEvent = new EventEmitter<boolean>();

  @Output() requestSignOutEvent = new EventEmitter<boolean>();

  constructor(private logger: NGXLogger) {
    this.logger.trace('new TopMenuComponent()');
  }

  ngOnInit(): void {}

  toggleSideMenu() {
    this.logger.trace('TopMenuComponent.toggleSideMenu()');
    this.toggleSideMenuEvent.emit(true);
  }

  requestSignOut() {
    this.logger.trace('TopMenuComponent.requestSignOut()');
    this.requestSignOutEvent.emit(true);
  }
}
