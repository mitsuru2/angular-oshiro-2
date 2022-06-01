//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Subject, Subscription } from 'rxjs';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { FirestoreCollectionName } from './firestore-collection-name.enum';
import { AbilityType, FacilityType, GeographType, Region } from './firestore-document.interface';
import { FirestoreCollectionWrapper } from './firestore-collection-wrapper.class';

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
  private collections: {
    [key in FirestoreCollectionName]:
      | FirestoreCollectionWrapper<AbilityType>
      | FirestoreCollectionWrapper<FacilityType>
      | FirestoreCollectionWrapper<GeographType>
      | FirestoreCollectionWrapper<Region>;
  } = {
    AbilityTypes: new FirestoreCollectionWrapper<AbilityType>(
      this.firestore,
      this.logger,
      FirestoreCollectionName.AbilityTypes
    ),
    FacilityTypes: new FirestoreCollectionWrapper<FacilityType>(
      this.firestore,
      this.logger,
      FirestoreCollectionName.FacilityTypes
    ),
    GeographTypes: new FirestoreCollectionWrapper<GeographType>(
      this.firestore,
      this.logger,
      FirestoreCollectionName.GeographTypes
    ),
    Regions: new FirestoreCollectionWrapper<Region>( // eslint-disable-line
      this.firestore, 
      this.logger, 
      FirestoreCollectionName.Regions
    ),
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
      this.loadingEvent$.next({ type: FirestoreLoadingEventType.Start, name: key as FirestoreCollectionName });
      this.collections[key as FirestoreCollectionName].load(() => {
        this.loadingEvent$.next({ type: FirestoreLoadingEventType.End, name: key as FirestoreCollectionName });
        if (this.isAllDataLoaded()) {
          this.loadingEvent$.next({ type: FirestoreLoadingEventType.Completed });
        }
      });
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
    for (let key in FirestoreCollectionName) {
      if (this.collections[key as FirestoreCollectionName].isLoaded === false) {
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
    return this.collections[name].data;
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

    if (name === FirestoreCollectionName.AbilityTypes) {
      let collection = new FirestoreCollectionWrapper<AbilityType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.FacilityTypes) {
      let collection = new FirestoreCollectionWrapper<FacilityType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.GeographTypes) {
      let collection = new FirestoreCollectionWrapper<GeographType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else {
      let collection = new FirestoreCollectionWrapper<Region>(
        this.firestore,
        this.logger,
        FirestoreCollectionName.Regions,
        query
      );
      return collection.data$.subscribe(next);
    }
  }
}
