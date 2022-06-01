import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { FirestoreCollectionName } from './firestore-collection-name.enum';

export class FirestoreCollectionWrapper<T> {
  private name: FirestoreCollectionName;

  data$: Observable<T[]>;

  data: T[] = [];

  isLoaded: boolean;

  private subscription: Subscription;

  constructor(
    private firestore: AngularFirestore,
    private logger: NGXLogger,
    name: FirestoreCollectionName,
    query?: QueryFn
  ) {
    this.logger.trace(`new FirestoreCollectionWrapper(${name})`);
    this.name = name;
    this.data$ = this.firestore.collection<T>(this.name, query).valueChanges();
    this.data = [];
    this.subscription = new Subscription();
    this.isLoaded = false;
  }

  load(cbFn?: () => void) {
    this.logger.trace('FirestoreCollectionWrapper.load()');
    this.subscription = this.data$.subscribe((x) => {
      this.data = x;
      this.isLoaded = true;
      this.subscription.unsubscribe();
      if (cbFn != undefined) {
        cbFn();
      }
    });
  }
}
