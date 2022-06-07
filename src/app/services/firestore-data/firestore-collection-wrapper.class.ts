import { AngularFirestore, AngularFirestoreCollection, QueryFn } from '@angular/fire/compat/firestore';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { FirestoreCollectionName } from './firestore-collection-name.enum';
import { increment } from '@angular/fire/firestore';

export class FirestoreCollectionWrapper<T> {
  private name: FirestoreCollectionName;

  collection: AngularFirestoreCollection<T>;

  data$: Observable<T[]>;

  data: T[] = [];

  isLoaded: boolean;

  private subscription: Subscription;

  constructor(
    private firestore: AngularFirestore,
    private logger: NGXLogger,
    name: FirestoreCollectionName,
    query: QueryFn = (ref) => ref.orderBy('index') // By default, it just sorts by 'index'.
  ) {
    this.logger.trace(`new FirestoreCollectionWrapper(${name})`);
    this.name = name;
    this.collection = this.firestore.collection<T>(this.name, query);
    this.data$ = this.collection.valueChanges({ idField: 'id' });
    this.data = [];
    this.subscription = new Subscription();
    this.isLoaded = false;
  }

  load(cbFn?: () => void) {
    this.logger.trace(`FirestoreCollectionWrapper[${this.name}].load()`);

    this.subscription = this.data$.subscribe((x) => {
      this.data = x;
      this.isLoaded = true;
      this.subscription.unsubscribe();
      if (cbFn != undefined) {
        cbFn();
      }
    });
  }

  add(data: any) {
    this.logger.trace(`FirestoreCollectionWrapper[${this.name}].add()`);
    this.collection.add(data as T);
  }
}
