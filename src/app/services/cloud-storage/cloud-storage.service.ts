import { Injectable } from '@angular/core';
import { ref, Storage, uploadBytes } from '@angular/fire/storage';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root',
})
export class CloudStorageService {
  readonly className = 'CloudStorageService';

  constructor(private logger: NGXLogger, private storage: Storage) {
    this.logger.trace(`new ${this.className}()`);
  }

  async upload(path: string, data: Blob): Promise<void> {
    const location = `${this.className}.upload()`;
    const dataRef = ref(this.storage, path);
    try {
      await uploadBytes(dataRef, data);
    } catch {
      this.logger.error(location, 'It failed to upload data.', { path: path });
    }
  }
}
