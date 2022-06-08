import { FirestoreCollectionName } from './firestore-collection-name.enum';
import { addDoc, collection, CollectionReference, Firestore, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/app-check';
import { getDocsFromServer } from '@firebase/firestore';
import { NGXLogger } from 'ngx-logger';

export class FirestoreCollectionWrapper<T> {
  private collection: CollectionReference<T>;

  data: any;

  isLoaded: boolean;

  isListening: boolean;

  private unsubscribe?: Unsubscribe;

  constructor(private fs: Firestore, private logger: NGXLogger, private name: FirestoreCollectionName) {
    this.collection = collection(this.fs, name) as CollectionReference<T>;
    this.data = {};
    this.isLoaded = false;
    this.isListening = false;
  }

  /**
   * It loads data from server once. (not subscribing.)
   * Offline cache will NOT used.
   * @returns Promise<number>. Data length.
   */
  async load(): Promise<number> {
    // Get data from server.
    try {
      // Copy document ID and its data to "this.data" object, if it's not empty.
      const snapshot = await getDocsFromServer(this.collection);
      if (snapshot.empty) {
        return 0;
      }
      snapshot.forEach((doc) => {
        this.data = { ...this.data, [doc.id]: doc.data() };
      });
      this.isLoaded = true;
      this.logger.info(`FirestoreCollectionWrapper: Data loading finished.`, {
        name: this.name,
        length: Object.keys(this.data).length,
      });
    } catch (error) {
      this.logger.error(`FirestoreCollectionWrapper: Data loading failed.`, { name: this.name }, error);
      throw error;
    }

    // Return data length.
    return Object.keys(this.data).length;
  }

  /**
   * It starts listening data from server.
   * ATTENTION: Don't forget to do stop listening by stopListening().
   */
  startListening(errorFn?: (e: Error) => void): void {
    this.isListening = true;

    this.unsubscribe = onSnapshot(
      this.collection,

      // Success handler. (It corresponding next() of Observable.)
      // Copy received data and set 'isLoaded' flag.
      (snapshot) => {
        this.data = {};
        snapshot.forEach((doc) => {
          this.data = { ...this.data, [doc.id]: doc.data() };
        });
        this.isLoaded = true;
        this.logger.info(`FirestoreCollectionWrapper: Listen data received.`, {
          name: this.name,
          length: Object.keys(this.data).length,
        });
      },

      // Error handler.
      // 'isListening' flag is cleared because it will stop listening automatically by error.
      (error) => {
        this.logger.error('FirestoreCollectionWrapper: Data listening failed.', { name: this.name }, error);
        this.isListening = false;
        if (errorFn != null) {
          errorFn(error);
        }
      }
    );
  }

  /**
   * It stops listening.
   */
  stopListening(): void {
    if (this.unsubscribe != null && this.isListening === true) {
      this.unsubscribe();
      this.isListening = false;
    }
  }

  /**
   * Add new document to the collection.
   * ID will be assigned automatically.
   * @param data Target data.
   * @returns Promise<boolean>. Return true if it succeeded.
   */
  async add(data: any): Promise<boolean> {
    try {
      await addDoc(this.collection, data);
    } catch (error) {
      return false;
    }

    return true;
  }
}
