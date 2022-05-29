import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppNavigateService } from './services/app-navigate/app-navigate.service';
import { AppStatus } from './services/app-navigate/app-status.enum';
import { FirestoreDataService, FirestoreLoadingEventType } from './services/firestore-data/firestore-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  appStatusValues = AppStatus;

  statusMessage: string = '';

  readonly title: string = 'スプラッシュ画面デモ';

  @ViewChild('mainComponent', { read: ViewContainerRef })
  mainComponent!: ViewContainerRef;

  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private router: Router,
    public appNavi: AppNavigateService
  ) {
    this.logger.trace('new AppComponent()');

    this.firestore.subscribeLoadingEvent((e) => {
      this.logger.debug(e);
      if (e.type === FirestoreLoadingEventType.Completed) {
        this.statusMessage = 'Data loading finished.';
        setTimeout(() => {
          this.appNavi.status = AppStatus.Loaded;
        }, 1000);
      } else if (e.type === FirestoreLoadingEventType.End) {
        this.statusMessage = `Data ${e.name} has been loaded.`;
      }
    });
  }

  goToMain() {
    this.logger.trace('AppComponent.goToMain()');
    this.router.navigateByUrl('/main');
    this.appNavi.status = AppStatus.Main;
  }

  async loadModule() {
    this.logger.trace('AppComponent.loadModule()');

    const { MainComponent } = await import('./modules/main/main.component');
    this.mainComponent.clear();
    this.mainComponent.createComponent(MainComponent);
  }
}
