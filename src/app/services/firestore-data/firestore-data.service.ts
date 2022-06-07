//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Subject, Subscription } from 'rxjs';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { FirestoreCollectionName } from './firestore-collection-name.enum';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterType,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeaponType,
} from './firestore-document.interface';
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
  collections: {
    [key in FirestoreCollectionName]:
      | FirestoreCollectionWrapper<FsAbility>
      | FirestoreCollectionWrapper<FsAbilityType>
      | FirestoreCollectionWrapper<FsCharacterType>
      | FirestoreCollectionWrapper<FsCharacter>
      | FirestoreCollectionWrapper<FsFacilityType>
      | FirestoreCollectionWrapper<FsGeographType>
      | FirestoreCollectionWrapper<FsIllustrator>
      | FirestoreCollectionWrapper<FsRegion>
      | FirestoreCollectionWrapper<FsVoiceActor>
      | FirestoreCollectionWrapper<FsWeaponType>;
  } = {
    Abilities:      new FirestoreCollectionWrapper<FsAbility>       (this.firestore, this.logger, FirestoreCollectionName.Abilities), // eslint-disable-line
    AbilityTypes:   new FirestoreCollectionWrapper<FsAbilityType>   (this.firestore, this.logger, FirestoreCollectionName.AbilityTypes), // eslint-disable-line
    CharacterTypes: new FirestoreCollectionWrapper<FsCharacterType> (this.firestore, this.logger, FirestoreCollectionName.CharacterTypes), // eslint-disable-line
    Characters:     new FirestoreCollectionWrapper<FsCharacter>     (this.firestore, this.logger, FirestoreCollectionName.Characters), // eslint-disable-line
    FacilityTypes:  new FirestoreCollectionWrapper<FsFacilityType>  (this.firestore, this.logger, FirestoreCollectionName.FacilityTypes), // eslint-disable-line
    GeographTypes:  new FirestoreCollectionWrapper<FsGeographType>  (this.firestore, this.logger, FirestoreCollectionName.GeographTypes), // eslint-disable-line
    Illustrators:   new FirestoreCollectionWrapper<FsIllustrator>   (this.firestore, this.logger, FirestoreCollectionName.Illustrators), // eslint-disable-line
    Regions:        new FirestoreCollectionWrapper<FsRegion>        (this.firestore, this.logger, FirestoreCollectionName.Regions), // eslint-disable-line
    VoiceActors:    new FirestoreCollectionWrapper<FsVoiceActor>    (this.firestore, this.logger, FirestoreCollectionName.VoiceActors), // eslint-disable-line
    WeaponTypes:    new FirestoreCollectionWrapper<FsWeaponType>    (this.firestore, this.logger, FirestoreCollectionName.WeaponTypes), // eslint-disable-line
  };

  private loadingEvent$: Subject<FirestoreLoadingEvent> = new Subject<FirestoreLoadingEvent>();

  /**
   * Class constructor.
   * It starts data loading.
   * @param firestore AngularFirestore is used to access database.
   * @param logger Logging utility.
   */
  constructor(public firestore: AngularFirestore, private logger: NGXLogger) {
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

    if (name === FirestoreCollectionName.Abilities) {
      let collection = new FirestoreCollectionWrapper<FsAbility>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.AbilityTypes) {
      let collection = new FirestoreCollectionWrapper<FsAbilityType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.CharacterTypes) {
      let collection = new FirestoreCollectionWrapper<FsCharacterType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.Characters) {
      let collection = new FirestoreCollectionWrapper<FsCharacter>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.FacilityTypes) {
      let collection = new FirestoreCollectionWrapper<FsFacilityType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.GeographTypes) {
      let collection = new FirestoreCollectionWrapper<FsGeographType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.Illustrators) {
      let collection = new FirestoreCollectionWrapper<FsIllustrator>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.Regions) {
      let collection = new FirestoreCollectionWrapper<FsRegion>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } else if (name === FirestoreCollectionName.VoiceActors) {
      let collection = new FirestoreCollectionWrapper<FsVoiceActor>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    } /*if (name === FirestoreCollectionName.WeaponTypes)*/ else {
      let collection = new FirestoreCollectionWrapper<FsWeaponType>(this.firestore, this.logger, name, query);
      return collection.data$.subscribe(next);
    }
  }

  addData(name: FirestoreCollectionName, data: any) {
    this.logger.trace(`FirestoreDataService.addData(${name})`);
    this.collections[name].add(data);
  }
}
