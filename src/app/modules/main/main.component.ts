import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  sideMenuItems = [
    {
      label: 'new',
      command: () => {
        this.navigate('/main/new-character');
      },
    },
    {
      label: 'list',
      command: () => {
        this.navigate('/main/list-character');
      },
    },
    {
      label: 'legal',
      command: () => {
        this.navigate('/main/legal');
      },
    },
  ];

  constructor(private logger: NGXLogger, private confirmDialog: ConfirmationService, private router: Router) {
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

  navigate(url: string): void {
    this.logger.trace(`MainComponent.goToNewCharacters(${url})`);
    this.router.navigateByUrl(url);
  }
}
