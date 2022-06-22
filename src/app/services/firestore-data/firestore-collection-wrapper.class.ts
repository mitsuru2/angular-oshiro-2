import { FsCollectionName } from './firestore-collection-name.enum';
import {
  addDoc,
  collection,
  CollectionReference,
  Firestore,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
} from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/app-check';
import { NGXLogger } from 'ngx-logger';
import { FsDocumentBase } from './firestore-document.interface';

export class FirestoreCollectionWrapper<T extends FsDocumentBase> {
  private className: string;

  private collection: CollectionReference<T>;

  data: FsDocumentBase[];

  isLoaded: boolean;

  isListening: boolean;

  private unsubscribe?: Unsubscribe;

  constructor(private fs: Firestore, private logger: NGXLogger, private name: FsCollectionName) {
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

    // Clear current data.
    while (this.data.length > 0) {
      this.data.pop();
    }

    // Get data.
    try {
      // Copy document ID and its data to "this.data" object, if it's not empty.
      const snapshot = await getDocs(this.collection);
      if (snapshot.empty) {
        throw Error(`${location} Empty data.`);
      }
      snapshot.forEach((doc) => {
        const tmp = doc.data();
        tmp.id = doc.id;
        this.data.push(tmp);
      });
      this.isLoaded = true;
      this.logger.info(`${location} Data loading finished.`, {
        name: this.name,
        length: Object.keys(this.data).length,
      });
    } catch (error) {
      this.logger.error(`${location} Data loading failed.`, { name: this.name }, error);
      throw error;
    }

    // Return data length.
    return Object.keys(this.data).length;
  }

  async loadSub<TSub extends FsDocumentBase>(docId: string, subName: string): Promise<TSub[]> {
    const location = `${this.className}.loadSub()`;
    this.logger.trace(location);

    const result: TSub[] = [];

    // Get data.
    try {
      // Copy document ID and its data to "this.data" object, if it's not empty.
      const subCollection = collection(this.fs, this.name, docId, subName) as CollectionReference<TSub>;
      const snapshot = await getDocsFromServer(subCollection);
      if (snapshot.empty) {
        throw Error(`${location} Empty data.`);
      }
      snapshot.forEach((doc) => {
        const tmp = doc.data() as TSub;
        tmp.id = doc.id;
        result.push(tmp);
      });
      this.logger.info(`${location} Data loading finished.`, {
        name: this.name,
        docId: docId,
        subName: subName,
        length: Object.keys(this.data).length,
      });
    } catch (error) {
      this.logger.error(`${location} Data loading failed.`, { name: this.name, docId: docId, subName: subName }, error);
      throw error;
    }

    return result;
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
   * @returns Promise<string>. New document ID.
   */
  async add(data: T): Promise<string> {
    const location = `${this.className}.add()`;
    this.logger.trace(location, { name: this.name, data: data });

    let docId = '';

    try {
      // Start transaction.
      await runTransaction(this.fs, async () => {
        // Reload data collection.
        await this.load();

        // If it found data which has same name as the target data.
        // It skip to add the target data because the data is already registered.
        for (let i = 0; i < this.data.length; ++i) {
          if (this.data[i].name === data.name) {
            this.logger.warn(location, 'Target data is already existing. Data adding is skipped.', {
              collection: this.name,
              id: this.data[i].id,
              name: this.data[i].name,
            });
            docId = this.data[i].id;
            return;
          }
        }

        // Remove 'id' field from the target data.
        const tmp = { ...data } as any;
        delete tmp.id;

        // Add target data to the server.
        const docRef = await addDoc(this.collection, tmp);
        docId = docRef.id;
        this.logger.info(location, 'Target data is added.', { collection: this.name, id: docId, name: data.name });

        return;
      });
    } catch (error) {
      this.logger.error(location, error);
    }

    return docId;
  }
}
