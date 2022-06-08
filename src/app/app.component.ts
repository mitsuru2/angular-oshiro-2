import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from './app-info.enum';
import { AppNavigateService } from './services/app-navigate/app-navigate.service';
import { AppStatus } from './services/app-navigate/app-status.enum';
import { FirestoreCollectionName } from './services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from './services/firestore-data/firestore-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  appStatusValues = AppStatus;

  statusMessage: string = '';

  readonly title: string = AppInfo.title;

  @ViewChild('mainComponent', { read: ViewContainerRef })
  mainComponent!: ViewContainerRef;

  constructor(
    private router: Router,
    private firestore: FirestoreDataService,
    public appNavi: AppNavigateService,
    private logger: NGXLogger
  ) {
    this.logger.trace('new AppComponent()');
  }

  async ngOnInit(): Promise<boolean> {
    this.logger.trace('AppComponent.ngOnInit()');

    try {
      this.firestore.startListening(FirestoreCollectionName.Characters);
    } catch {
      this.logger.error('CATCH!!!');
    }

    try {
      await Promise.all([
        this.firestore.load(FirestoreCollectionName.CharacterTypes),
        this.firestore.load(FirestoreCollectionName.Regions),
      ]);
      this.logger.info(`AppComponent: All const data has been loaded.`);
      this.appNavi.status = AppStatus.Loaded;
    } catch {
      this.logger.error('error occurred.');
      this.appNavi.status = AppStatus.Error;
    }
    return true;
  }

  private listenErrorCb(e: Error) {
    this.logger.trace(`AppComponent.listenErrorCb(${e})`);
    this.appNavi.status = AppStatus.Error;
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

  async asyncProc1() {
    console.log('asyncProc1() start');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('asyncProc1() end.');
        resolve(1);
      }, 3000);
    });
  }

  async asyncProc2() {
    console.log('asyncProc2() start');
    await this.asyncProc1(); // ここから非同期。
    console.log('asyncProc2() end.');
  }

  syncProc() {
    console.log('syncProc() start');
    this.asyncProc2();
    console.log('syncProc() end');
  }
}
