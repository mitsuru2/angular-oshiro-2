//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Firestore, doc, runTransaction } from '@angular/fire/firestore';
import { FsCollectionName } from './firestore-collection-name.enum';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsSubCharacterType,
  FsCharacterTag,
  FsCharacterType,
  FsDocumentBaseWithCode,
  FsDocumentBaseWithOrder,
  FsFacility,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeapon,
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

  collections: { [key in FsCollectionName]: FirestoreCollectionWrapper<any> } = {
    [FsCollectionName.Abilities]:      new FirestoreCollectionWrapper<FsAbility>       (this.fs, this.logger, FsCollectionName.Abilities), // eslint-disable-line
    [FsCollectionName.AbilityTypes]:   new FirestoreCollectionWrapper<FsAbilityType>   (this.fs, this.logger, FsCollectionName.AbilityTypes), // eslint-disable-line
    [FsCollectionName.CharacterTags]:  new FirestoreCollectionWrapper<FsCharacterTag>  (this.fs, this.logger, FsCollectionName.CharacterTags), // eslint-disable-line
    [FsCollectionName.CharacterTypes]: new FirestoreCollectionWrapper<FsCharacterType> (this.fs, this.logger, FsCollectionName.CharacterTypes), // eslint-disable-line
    [FsCollectionName.Characters]:     new FirestoreCollectionWrapper<FsCharacter>     (this.fs, this.logger,FsCollectionName.Characters), // eslint-disable-line
    [FsCollectionName.Facilities]:     new FirestoreCollectionWrapper<FsFacility>      (this.fs, this.logger, FsCollectionName.Facilities), // eslint-disable-line
    [FsCollectionName.FacilityTypes]:  new FirestoreCollectionWrapper<FsFacilityType>  (this.fs, this.logger, FsCollectionName.FacilityTypes), // eslint-disable-line
    [FsCollectionName.GeographTypes]:  new FirestoreCollectionWrapper<FsGeographType>  (this.fs, this.logger, FsCollectionName.GeographTypes), // eslint-disable-line
    [FsCollectionName.Illustrators]:   new FirestoreCollectionWrapper<FsIllustrator>   (this.fs, this.logger, FsCollectionName.Illustrators), // eslint-disable-line
    [FsCollectionName.Regions]:        new FirestoreCollectionWrapper<FsRegion>        (this.fs, this.logger,FsCollectionName.Regions), // eslint-disable-line
    [FsCollectionName.VoiceActors]:    new FirestoreCollectionWrapper<FsVoiceActor>    (this.fs, this.logger, FsCollectionName.VoiceActors), // eslint-disable-line
    [FsCollectionName.Weapons]:        new FirestoreCollectionWrapper<FsWeapon>        (this.fs, this.logger, FsCollectionName.Weapons), // eslint-disable-line
    [FsCollectionName.WeaponTypes]:    new FirestoreCollectionWrapper<FsWeaponType>    (this.fs, this.logger, FsCollectionName.WeaponTypes), // eslint-disable-line
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
  async load(name: FsCollectionName): Promise<number> {
    const location = `${this.className}.load()`;
    this.logger.trace(location, { name: name });

    let result: number = 0;

    try {
      const collection = this.collections[name as FsCollectionName];
      result = await collection.load();

      // Special process for CharacterTypes collection.
      // It needs sub collection loading.
      if (name === FsCollectionName.CharacterTypes) {
        await this.loadSubCharacterTypes();
      }
    } catch (error) {
      throw error;
    }

    return result;
  }

  startListening(name: FsCollectionName, errorFn?: (e: Error) => void) {
    this.logger.trace(`FirestoreDataService.startListening(${name})`);
    this.collections[name as FsCollectionName].startListening(errorFn);
  }

  stopListening(name: FsCollectionName) {
    this.logger.trace(`FirestoreDataService.startListening(${name})`);
    this.collections[name as FsCollectionName].stopListening();
  }

  /**
   * It returns data body of target data collection.
   * User shall cast the got data.
   * @param name Data collection name.
   * @returns Data body of target data collection.
   */
  getData(name: FsCollectionName) {
    this.logger.trace(`FirestoreDataService.getData(${name})`);
    return this.collections[name].data;
  }

  addData(name: FsCollectionName, data: any) {
    this.logger.trace(`FirestoreDataService.addData(${name})`);
    this.collections[name].add(data);
  }

  /**
   * Increment 'count' field of the specified document.
   * @param name Data collection name.
   * @param index Document index.
   * @returns Promise with number. The number represents the counter value before increment.
   */
  async incrementCounter(name: FsCollectionName, index: number): Promise<number> {
    this.logger.trace(`FirestoreDataService.incrementCounter(${name}, ${index})`);

    if (name === FsCollectionName.CharacterTypes) {
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

  private async loadSubCharacterTypes() {
    const fsCollection = this.collections[FsCollectionName.CharacterTypes];

    for (let i = 0; i < fsCollection.data.length; ++i) {
      const docData = fsCollection.data[i] as FsCharacterType;
      if (docData.hasSubTypes) {
        docData.subTypes = await fsCollection.loadSub<FsSubCharacterType>(docData.id, 'SubTypes');
        this.logger.debug(location, docData);
      }
    }
  }
}
