//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Firestore, doc, runTransaction } from '@angular/fire/firestore';
import { FirestoreCollectionName } from './firestore-collection-name.enum';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterType,
  FsDocumentBaseWithCode,
  FsDocumentBaseWithOrder,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeaponType,
} from './firestore-document.interface';
import { FirestoreCollectionWrapper } from './firestore-collection-wrapper.class';

//==============================================================================
// Service class implementation.
//
/**
 * FirestoreDataService
 *
 * It supports following functionalites:
 *  - One time data loading.
 *  - Continuous data listening.
 *  - New document creation to the specified collection.
 *  - Increment counter for FsDocumentBaseWidhCode.
 *  - Data sorting.
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreDataService {
  private className = 'FirestoreDataService';

  collections: { [key in FirestoreCollectionName]: FirestoreCollectionWrapper<any> } = {
    //   Abilities:      new FirestoreCollectionWrapper<FsAbility>       (this.fs, this.logger, FirestoreCollectionName.Abilities), // eslint-disable-line
    //   AbilityTypes:   new FirestoreCollectionWrapper<FsAbilityType>   (this.fs, this.logger, FirestoreCollectionName.AbilityTypes), // eslint-disable-line
    [FirestoreCollectionName.CharacterTypes]: new FirestoreCollectionWrapper<FsCharacterType> (this.fs, this.logger, FirestoreCollectionName.CharacterTypes), // eslint-disable-line
    [FirestoreCollectionName.Characters]:     new FirestoreCollectionWrapper<FsCharacter>     (this.fs, this.logger,FirestoreCollectionName.Characters), // eslint-disable-line
    //   FacilityTypes:  new FirestoreCollectionWrapper<FsFacilityType>  (this.fs, this.logger, FirestoreCollectionName.FacilityTypes), // eslint-disable-line
    [FirestoreCollectionName.GeographTypes]:  new FirestoreCollectionWrapper<FsGeographType>  (this.fs, this.logger, FirestoreCollectionName.GeographTypes), // eslint-disable-line
    //   Illustrators:   new FirestoreCollectionWrapper<FsIllustrator>   (this.fs, this.logger, FirestoreCollectionName.Illustrators), // eslint-disable-line
    [FirestoreCollectionName.Regions]:        new FirestoreCollectionWrapper<FsRegion>        (this.fs, this.logger,FirestoreCollectionName.Regions), // eslint-disable-line
    //   VoiceActors:    new FirestoreCollectionWrapper<FsVoiceActor>    (this.fs, this.logger, FirestoreCollectionName.VoiceActors), // eslint-disable-line
    [FirestoreCollectionName.WeaponTypes]:    new FirestoreCollectionWrapper<FsWeaponType>    (this.fs, this.logger, FirestoreCollectionName.WeaponTypes), // eslint-disable-line
  };

  /**
   * Class constructor.
   * It starts data loading.
   * @param fs Firestore is used to access database.
   * @param logger Logging utility.
   */
  constructor(private fs: Firestore, private logger: NGXLogger) {
    this.logger.trace('new FirestoreDataService()');
  }

  /**
   * It loads all document data of the target collection once.
   * @param name Firestore collection name.
   * @returns Promise<number>. Return true if it succeeded.
   */
  async load(name: FirestoreCollectionName): Promise<number> {
    this.logger.trace(`FirestoreDataService.load(${name})`);

    let result: number = 0;

    try {
      result = await this.collections[name as FirestoreCollectionName].load();
    } catch (error) {
      throw error;
    }

    return result;
  }

  startListening(name: FirestoreCollectionName, errorFn?: (e: Error) => void) {
    this.logger.trace(`FirestoreDataService.startListening(${name})`);
    this.collections[name as FirestoreCollectionName].startListening(errorFn);
  }

  stopListening(name: FirestoreCollectionName) {
    this.logger.trace(`FirestoreDataService.startListening(${name})`);
    this.collections[name as FirestoreCollectionName].stopListening();
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

  addData(name: FirestoreCollectionName, data: any) {
    this.logger.trace(`FirestoreDataService.addData(${name})`);
    this.collections[name].add(data);
  }

  /**
   * Increment 'count' field of the specified document.
   * @param name Data collection name.
   * @param index Document index.
   * @returns Promise with number. The number represents the counter value before increment.
   */
  async incrementCounter(name: FirestoreCollectionName, index: number): Promise<number> {
    this.logger.trace(`FirestoreDataService.incrementCounter(${name}, ${index})`);

    if (name === FirestoreCollectionName.CharacterTypes) {
      const docId = this.collections[name].data[index].id;
      const docRef = doc(this.fs, `${name}/${docId}`);
      let count = 0;

      await runTransaction(this.fs, async (transaction) => {
        const docBody = await transaction.get(docRef);

        if (!docBody.exists()) {
          this.logger.error(
            `FirestoreDataService.incrementCounter() | Document was not found. { path: ${name}/${docId} }`
          );
          throw Error(`FirestoreDataService.incrementCounter() | Document was not found. { path: ${name}/${docId} }`);
        }

        count = (docBody.data() as FsCharacterType).count;
        transaction.update(docRef, { count: count + 1 });
      });

      this.logger.debug(`count: ${count}`);

      return count;
    } else {
      this.logger.error(`FirestoreDataService.incrementCounter() | Unsupported collection. { name: ${name} }`);
      throw Error(`FirestoreDataService.incrementCounter() | Unsupported collection. { name: ${name} }`);
    }
  }

  sortByOrder(items: FsDocumentBaseWithOrder[], isDesc: boolean = false) {
    const location = `${this.className}.FsDocumentBaseWithOrder()`;
    this.logger.trace(location);

    // Ascending order.
    if (isDesc === false) {
      items.sort((a, b) => a.order - b.order);
    }
    // Descending order.
    else {
      items.sort((a, b) => b.order - a.order);
    }
  }

  sortByCode(items: FsDocumentBaseWithCode[], isDesc: boolean = false) {
    const location = `${this.className}.FsDocumentBaseWithOrder()`;
    this.logger.trace(location);

    // Ascending order.
    if (isDesc === false) {
      items.sort((a, b) => {
        return a.code < b.code ? -1 : 1;
      });
    }
    // Descending order.
    else {
      items.sort((a, b) => {
        return b.code < a.code ? -1 : 1;
      });
    }
  }
}
