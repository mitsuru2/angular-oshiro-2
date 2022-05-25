import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { GeographType } from './geograph-type.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-oshiro-2';

  geographTypes$: Observable<GeographType[]> | undefined;

  geographTypes: GeographType[] | undefined;

  geographTypes2: GeographType[] | undefined;

  constructor(private firestore: AngularFirestore) {
    this.geographTypes$ = this.firestore.collection<GeographType>('GeographTypes', (ref) => ref.orderBy('order')).valueChanges();
    this.geographTypes$.subscribe((x) => (this.geographTypes = x));
    this.geographTypes$.subscribe((x) => (this.geographTypes2 = x.sort((a, b) => a.id - b.id)));
  }
}
