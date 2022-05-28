import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FirestoreDataService, FirestoreLoadingEventType } from './services/firestore-data/firestore-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isInitialized: boolean = false;

  statusMessage: string = '';

  readonly title: string = 'スプラッシュ画面デモ';

  @ViewChild('mainComponent', { read: ViewContainerRef })
  mainComponent!: ViewContainerRef;

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace('new AppComponent()');

    this.firestore.subscribeLoadingEvent((e) => {
      this.logger.debug(e);
      if (e.type === FirestoreLoadingEventType.Completed) {
        this.statusMessage = 'Data loading finished.';
      } else if (e.type === FirestoreLoadingEventType.End) {
        this.statusMessage = `Data ${e.name} has been loaded.`;
      }
    });
  }

  async loadModule() {
    this.logger.trace('AppComponent.loadModule()');

    const { MainComponent } = await import('./modules/main/main.component');
    this.mainComponent.clear();
    this.mainComponent.createComponent(MainComponent);
  }
}
