import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { AppInfo } from 'src/app/app-info.enum';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  appInfo = AppInfo;

  isSignedIn = true;

  isVisible = true;

  isSideMenuOpen = true;

  constructor(private logger: NGXLogger, private confirmDialog: ConfirmationService) {
    this.logger.trace('new MainComponent()');
  }

  ngOnInit(): void {}

  askSignOut(): void {
    this.logger.trace('MainComponent.askSignOut()');
    this.confirmDialog.confirm({
      message: 'Are you sure to sign out?',
      accept: () => {
        this.isSignedIn = false;
      },
    });
  }

  toggleSideMenu(): void {
    this.logger.trace('MainComponent.toggleSideMenu()');
    this.isSideMenuOpen = !this.isSideMenuOpen;
  }
}
