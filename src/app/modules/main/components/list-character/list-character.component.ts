import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsAbilityType,
  FsCharacter,
  FsFacility,
  FsFacilityType,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';

export class ThumbImageWrapper {
  url: string = '';

  data: Blob = new Blob();
}

export class Paginator {
  first: number = 0;

  rowNum: number = 5;

  rowIndexes: number[] = [];

  constructor() {
    for (let i = 0; i < this.rowNum; ++i) {
      this.rowIndexes.push(i);
    }
  }
}

@Component({
  selector: 'app-list-character',
  templateUrl: './list-character.component.html',
  styleUrls: ['./list-character.component.scss'],
})
export class ListCharacterComponent implements OnInit, AfterViewInit {
  readonly className = 'ListCharacterComponent';

  appInfo = AppInfo;

  /** View status. */
  viewInited = false;

  thumbLoaded = false;

  /** Firestore data. */
  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

  /** List data source. */

  abilityTypes!: FsAbilityType[];

  weaponTypes!: FsWeaponType[];

  weapons!: FsWeapon[];

  facilityTypes!: FsFacilityType[];

  facilities!: FsFacility[];

  /** Data view: header. */
  isListLayout = false;

  inputSearchText = '';

  /** Data view: contents. */
  filteredIndexes: number[] = [];

  thumbImages: ThumbImageWrapper[] = [];

  /** Data view: footer. */
  paginator = new Paginator();

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService
  ) {
    this.logger.trace(`new ${this.className}()`);

    // Filter index array.
    for (let i = 0; i < this.characters.length; ++i) {
      this.filteredIndexes.push(i);
    }

    // Thumbnail image info.
    for (let i = 0; i < this.characters.length; ++i) {
      this.thumbImages.push(new ThumbImageWrapper());
    }
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    this.characters.sort((a, b) => {
      return a.index < b.index ? -1 : 1;
    });

    const thumbCount = await this.loadThumbImages();

    if (this.viewInited) {
      for (let i = 0; i < thumbCount; ++i) {
        const img = document.getElementById(`Thumb_${i}`) as HTMLImageElement;
        img.src = this.thumbImages[this.filteredIndexes[i]].url;
      }
    }
  }

  ngAfterViewInit(): void {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    this.viewInited = true;

    if (this.thumbLoaded) {
      for (let i = 0; i < this.paginator.rowNum; ++i) {
        if (i >= this.filteredIndexes.length) {
          break;
        }
        const img = document.getElementById(`Thumb_${i}`) as HTMLImageElement;
        img.src = this.thumbImages[this.filteredIndexes[i]].url;
      }
    }
  }

  //============================================================================
  // Private methods.
  //
  private async loadThumbImages(): Promise<number> {
    const location = `${this.className}.loadThumbImages()`;

    const promises: Promise<Blob>[] = [];
    let thumbCount = 0;

    for (let i = 0; i < this.paginator.rowNum; ++i) {
      // Exit loop if out of filtered index list.
      if (i >= this.filteredIndexes.length) {
        break;
      }

      // Call image load function and store the returned promise.
      const path = this.storage.makeCharacterThumbnailPath(this.characters[this.filteredIndexes[i]].index);
      promises.push(this.storage.get(path));
      thumbCount++;
    }

    // Wait all promises.
    const blobs = await Promise.all(promises);

    // Store thumnail images.
    for (let i = 0; i < thumbCount; ++i) {
      this.thumbImages[this.filteredIndexes[i]].data = blobs[i];
      this.thumbImages[this.filteredIndexes[i]].url = window.URL.createObjectURL(blobs[i]);
    }

    // Set flag.
    this.thumbLoaded = true;

    this.logger.info(location, 'Thumbnail images are loaded.', { count: thumbCount });

    return thumbCount;
  }
}
