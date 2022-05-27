import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { GeographType } from './geograph-type.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isInitialized: boolean = false;

  statusMessage: string = '';

  readonly title: string = '御城プロジェクト:RE - ユニット管理くん';

  @ViewChild('mainComponent', { read: ViewContainerRef })
  mainComponent!: ViewContainerRef;

  geographTypes$: Observable<GeographType[]> | undefined;

  geographTypes: GeographType[] | undefined;

  geographTypes2: GeographType[] | undefined;

  constructor(private firestore: AngularFirestore, private logger: NGXLogger) {
    this.logger.trace('new AppComponent()');

    this.geographTypes$ = this.firestore
      .collection<GeographType>('GeographTypes', (ref) => ref.orderBy('order'))
      .valueChanges();
    this.geographTypes$.subscribe((x) => {
      this.geographTypes = x;
      this.statusMessage = 'GeographType has been loaded.';
    });
    this.geographTypes$.subscribe((x) => {
      this.geographTypes2 = x.sort((a, b) => a.id - b.id);
      this.isInitialized = false;
    });
  }

  async loadModule() {
    this.logger.trace('AppComponent.loadModule()');

    const { MainComponent } = await import('./modules/main/main.component');
    this.mainComponent.clear();
    this.mainComponent.createComponent(MainComponent);
  }
}
