//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subject, Subscription } from 'rxjs';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { FirestoreCollectionName } from './firestore-collection-name.enum';
import { GeographType } from './geograph-type.interface';
import { Region } from './region.interface';

//==============================================================================
// Type definitions.
//
/**
 * Data loading events for this service.
 */
export enum FirestoreLoadingEventType {
  Start = 0,
  End,
  Completed,
}

/**
 * Data loading event information for this service.
 */
export type FirestoreLoadingEvent =
  | {
      type: FirestoreLoadingEventType.Start | FirestoreLoadingEventType.End;
      name: FirestoreCollectionName;
    }
  | {
      type: FirestoreLoadingEventType.Completed;
    };

/**
 * Subscribe function type.
 */
export type SubscribeFn = (x: any) => void;

//==============================================================================
// Service class implementation.
//
/**
 * FirestoreDataService
 *
 * It will load all data from Firestore database at initialization.
 * User can get data directly (after initialization), or subscribe data.
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreDataService {
  private observables: { [key in FirestoreCollectionName]: Observable<GeographType[]> | Observable<Region[]> } = {
    GeographTypes: new Observable<GeographType[]>(),
    Regions: new Observable<Region[]>(),
  };

  private subscriptions: { [key in FirestoreCollectionName]: Subscription } = {
    GeographTypes: new Subscription(),
    Regions: new Subscription(),
  };

  private dataBodies: { [key in FirestoreCollectionName]: GeographType[] | Region[] } = {
    GeographTypes: [],
    Regions: [],
  };

  private loadFlags: { [key in FirestoreCollectionName]: boolean } = {
    GeographTypes: false,
    Regions: false,
  };

  private loadingEvent$: Subject<FirestoreLoadingEvent> = new Subject<FirestoreLoadingEvent>();

  /**
   * Class constructor.
   * It starts data loading.
   * @param firestore AngularFirestore is used to access database.
   * @param logger Logging utility.
   */
  constructor(private firestore: AngularFirestore, private logger: NGXLogger) {
    this.logger.trace('new FirestoreDataService()');

    for (let key in FirestoreCollectionName) {
      this.initObservable(key as FirestoreCollectionName);
      this.subsucribe(key as FirestoreCollectionName);
    }
  }

  /**
   * This service push loading event of self-data loading during the service initialization.
   * @param next Observer function.
   */
  subscribeLoadingEvent(next: (value: FirestoreLoadingEvent) => void) {
    this.loadingEvent$.subscribe(next);
    if (this.isAllDataLoaded()) {
      this.loadingEvent$.next({ type: FirestoreLoadingEventType.Completed });
    }
  }

  /**
   * It returns the flag if the data loading at initialization has been finished or not.
   * User can get data if the return value is TRUE.
   * @returns TRUE if all data collections are loaded.
   */
  isAllDataLoaded(): boolean {
    for (let key in this.loadFlags) {
      if (this.loadFlags[key as FirestoreCollectionName] === false) {
        return false;
      }
    }
    return true;
  }

  /**
   * It returns data body of target data collection.
   * User shall cast the got data.
   * @param name Data collection name.
   * @returns Data body of target data collection.
   */
  getData(name: FirestoreCollectionName) {
    this.logger.trace(`FirestoreDataService.getData(${name})`);
    return this.dataBodies[name];
  }

  /**
   * It does several process at 1 step.
   *   - Query data on Firestore.
   *   - Get observable.
   *   - Start subscription.
   * ATTENTION: User shall execute unsubscribe when exit page.
   *            For example, ngOnDestroy() is recommended.
   * @param name Target data collection.
   * @param query Query function.
   * @param next Observer.next function.
   * @returns Subscription.
   */
  queryData(name: FirestoreCollectionName, query: QueryFn, next: SubscribeFn): Subscription {
    this.logger.trace(`FirestoreDataService.queryData(${name})`);

    let observable = this.makeObservable(name, query);
    return observable.subscribe(next);
  }

  private initObservable(name: FirestoreCollectionName) {
    this.logger.trace(`FirestoreDataService.initObservable(${name})`);

    this.observables[name] = this.makeObservable(name, (ref) => ref.orderBy('id'));
    this.loadingEvent$.next({ type: FirestoreLoadingEventType.Start, name: name });
  }

  private makeObservable(name: FirestoreCollectionName, query: QueryFn) {
    if (name === FirestoreCollectionName.GeographTypes) {
      return this.firestore.collection<GeographType>(name, query).valueChanges();
    } /*if (name === FirestoreCollectionName.Regions)*/ else {
      return this.firestore.collection<Region>(name, query).valueChanges();
    }
  }

  private subsucribe(name: FirestoreCollectionName) {
    this.logger.trace(`FirestoreDataService.subscribe(${name})`);

    // Do subscribe() and unsubscribe().
    this.subscriptions[name] = this.observables[name].subscribe((x) => {
      this.dataBodies[name] = x;
      this.loadFlags[name] = true;
      this.subscriptions[name].unsubscribe();
      this.loadingEvent$.next({ type: FirestoreLoadingEventType.End, name: name });
      if (this.isAllDataLoaded()) {
        this.logger.info('All collection data has been loaded.');
        this.loadingEvent$.next({ type: FirestoreLoadingEventType.Completed });
      }
    });
  }
}
