import { FirestoreCollectionName } from './firestore-collection-name.enum';
import {
  addDoc,
  collection,
  CollectionReference,
  Firestore,
  getDocsFromServer,
  onSnapshot,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/app-check';
import { NGXLogger } from 'ngx-logger';
import { FsDocumentBase } from './firestore-document.interface';

export class FirestoreCollectionWrapper<T extends FsDocumentBase> {
  private className: string;

  private collection: CollectionReference<T>;

  data: any[];

  isLoaded: boolean;

  isListening: boolean;

  private unsubscribe?: Unsubscribe;

  constructor(private fs: Firestore, private logger: NGXLogger, private name: FirestoreCollectionName) {
    this.className = `FirestoreCollectionWrapper`;
    this.logger.trace(`new ${this.className}()`, { name: name });

    this.collection = collection(this.fs, name) as CollectionReference<T>;
    this.data = [];
    this.isLoaded = false;
    this.isListening = false;
  }

  /**
   * It loads data from server once. (not subscribing.)
   * Offline cache will NOT used.
   * @returns Promise<number>. Data length.
   */
  async load(): Promise<number> {
    const location = `${this.className}.load()`;
    this.logger.trace(`${location}`, { name: this.name });

    // Get data from server.
    try {
      // Copy document ID and its data to "this.data" object, if it's not empty.
      const q = query(this.collection, orderBy('index'));
      const snapshot = await getDocsFromServer(q);
      if (snapshot.empty) {
        return 0;
      }
      snapshot.forEach((doc) => {
        const tmp = doc.data();
        tmp.id = doc.id;
        this.data.push(tmp);
      });
      this.isLoaded = true;
      this.logger.info(`${location} | Data loading finished.`, {
        name: this.name,
        length: Object.keys(this.data).length,
      });
    } catch (error) {
      this.logger.error(`${location} | Data loading failed.`, { name: this.name }, error);
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
    const location = `${this.className}.startListening()`;
    this.logger.trace(`${location}`, { name: this.name });

    this.isListening = true;

    const q = query(this.collection, orderBy('index'));

    this.unsubscribe = onSnapshot(
      // Query.
      q,

      // Success handler. (It corresponding next() of Observable.)
      // Copy received data and set 'isLoaded' flag.
      (snapshot) => {
        while (this.data.length > 0) {
          this.data.pop();
        }
        snapshot.forEach((doc) => {
          const tmp = doc.data();
          tmp.id = doc.id;
          this.data.push(tmp);
        });
        this.isLoaded = true;
        this.logger.info(`${location} | Listen data received.`, {
          name: this.name,
          length: Object.keys(this.data).length,
        });
      },

      // Error handler.
      // 'isListening' flag is cleared because it will stop listening automatically by error.
      (error) => {
        this.logger.error('${location} | Data listening failed.', { name: this.name }, error);
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
    const location = `${this.className}.stopListening()`;
    this.logger.trace(`${location}`, { name: this.name });

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
    const location = `${this.className}.add()`;
    this.logger.trace(`${location}`, { name: this.name });

    try {
      await addDoc(this.collection, data);
    } catch (error) {
      return false;
    }

    return true;
  }
}
