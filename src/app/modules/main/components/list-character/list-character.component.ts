import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterTag,
  FsFacility,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';

export class ThumbImageWrapper {
  url: string = '';

  data: Blob = new Blob();
}

export class Paginator {
  first: number = 0;

  rowNum: number = 4;

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

  abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];

  abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];

  characterTags = this.firestore.getData(FsCollectionName.CharacterTags) as FsCharacterTag[];

  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

  facilities = this.firestore.getData(FsCollectionName.Facilities) as FsFacility[];

  facilityTypes = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];

  geographTypes = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];

  illustrators = this.firestore.getData(FsCollectionName.Illustrators) as FsIllustrator[];

  regions = this.firestore.getData(FsCollectionName.Regions) as FsRegion[];

  voiceActors = this.firestore.getData(FsCollectionName.VoiceActors) as FsVoiceActor[];

  weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];

  weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeapon[];

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

    // Start loading of thumnail images.
    await this.loadThumbImages();

    // Update thumbnail images if view initialization has been finished.
    if (this.viewInited) {
      this.updateThumbImages();
      this.makeCharacterInfoTables();
    }
  }

  ngAfterViewInit(): void {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    // Set view initialized flag.
    this.viewInited = true;

    // Update thumbnail images if image loading has been finished.
    if (this.thumbLoaded) {
      this.updateThumbImages();
      this.makeCharacterInfoTables();
    }
  }

  async onPageChange(event: any) {
    const location = `${this.className}.onPageChange()`;
    this.logger.trace(location, event);

    // Update paginate info.
    this.paginator.first = event.first;

    // Load thumbnail images.
    await this.loadThumbImages();

    // Update thumbnail images.
    this.updateThumbImages();
    this.makeCharacterInfoTables();
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
      if (i + this.paginator.first >= this.filteredIndexes.length) {
        break;
      }

      // Call image load function and store the returned promise.
      const index = this.characters[this.filteredIndexes[i + this.paginator.first]].index;
      const path = this.storage.makeCharacterThumbnailPath(index);
      promises.push(this.storage.get(path));
      thumbCount++;
    }

    // Wait all promises.
    const blobs = await Promise.all(promises);

    // Store thumnail images.
    for (let i = 0; i < thumbCount; ++i) {
      this.thumbImages[this.filteredIndexes[i + this.paginator.first]].data = blobs[i];
      this.thumbImages[this.filteredIndexes[i + this.paginator.first]].url = window.URL.createObjectURL(blobs[i]);
    }

    // Set flag.
    this.thumbLoaded = true;

    this.logger.info(location, 'Thumbnail images are loaded.', { count: thumbCount });

    return thumbCount;
  }

  private updateThumbImages() {
    const location = `${this.className}.updateThumbImages()`;

    // Precondition.
    if (!this.thumbLoaded) {
      throw Error(`${location} Image shall be loaded beforehand.`);
    }
    if (!this.viewInited) {
      throw Error(`${location} View shall be initialized beforehand.`);
    }

    // Update image element on HTML.
    for (let i = 0; i < this.paginator.rowNum; ++i) {
      // Get image element.
      const img = document.getElementById(`ListCharacter_Thumb_${i}`) as HTMLImageElement;
      if (!img) {
        throw Error(`${location} Image element is not available.`);
      }

      // Set image URL to the image element.
      // Hide image element if the index is out of range.
      if (i + this.paginator.first < this.filteredIndexes.length) {
        const iCharacter = this.filteredIndexes[i + this.paginator.first];
        img.src = this.thumbImages[iCharacter].url;
        img.hidden = false;
      } else {
        img.hidden = true;
      }
    }
  }

  private makeCharacterInfoTables() {
    const location = `${this.className}.makeCharacterInfoTable()`;

    // Precondition.
    if (!this.viewInited) {
      throw Error(`${location} View shall be initialized beforehand.`);
    }

    // Make table for each characters.
    for (let i = 0; i < this.paginator.rowNum; ++i) {
      const tableId = `ListCharacter_Table_${i}`;
      if (i + this.paginator.first < this.filteredIndexes.length) {
        const iCharacter = this.filteredIndexes[i + this.paginator.first];
        this.makeCharacterInfoTable(tableId, iCharacter);
      } else {
        // Clear table.
        this.clearTable(tableId);
      }
    }
  }

  private makeCharacterInfoTable(tableId: string, iCharacter: number) {
    const character = this.characters[iCharacter];

    // Clear table.
    this.clearTable(tableId);

    // Get tbody element.
    const t = document.getElementById(tableId) as HTMLTableElement;
    const tbody = t.tBodies.length === 0 ? t.createTBody() : t.tBodies[0];

    // 1st row: Character name.
    let tr = tbody.insertRow();
    let td = tr.insertCell();
    td.textContent = `${character.name} (★${character.rarerity})`;
    td.colSpan = 2;
    td.style.border = 'solid';
    td.style.borderWidth = 'thin';
    // td.style.borderCollapse = 'collapse';

    // 2nd row: Basic information.
    tr = tbody.insertRow();
    td = tr.insertCell();
    td.textContent = '基本情報';
    td.style.border = 'solid';
    td.style.borderWidth = 'thin';
    // td.style.borderCollapse = 'collapse';

    td = tr.insertCell();
    td.textContent = this.makeBasicInfoText(character);
    td.style.border = 'solid';
    td.style.borderWidth = 'thin';
    // td.style.borderCollapse = 'collapse';

    // t.style.border = 'solid';
    // t.style.borderWidth = 'thin';
    t.style.borderCollapse = 'collapse';
  }

  private clearTable(tableId: string) {
    const t = document.getElementById(tableId) as HTMLTableElement;

    if (t) {
      for (let i = 0; i < t.tBodies.length; ++i) {
        while (t.tBodies[i].rows.length > 0) {
          t.deleteRow(0);
        }
      }
    }
  }

  private makeBasicInfoText(character: FsCharacter): string {
    let result = '';

    // Weapon type.
    if (character.weaponType !== '') {
      let tmp = '武器タイプ: ';
      let wt = this.weaponTypes.find((item) => item.id === character.weaponType);
      tmp += wt ? wt.name : 'n.a.';
      result += tmp;
    }

    // Geograph types.
    if (character.geographTypes.length > 0) {
      let tmp = ', 地形属性: ';
      for (let i = 0; i < character.geographTypes.length; ++i) {
        let gt = this.geographTypes.find((item) => item.id === character.geographTypes[i]);
        if (i > 0) {
          tmp += '/';
        }
        tmp += gt ? gt.name : 'n.a.';
      }
      result += tmp;
    }

    // Region
    if (character.region !== '') {
      let tmp = ', 地域: ';
      let rg = this.regions.find((item) => item.id === character.region);
      tmp += rg ? rg.name : 'n.a.';
      result += tmp;
    }

    // CV
    if (character.voiceActors.length > 0) {
      let tmp = ', CV: ';
      for (let i = 0; i < character.voiceActors.length; ++i) {
        let cv = this.voiceActors.find((item) => item.id === character.voiceActors[i]);
        if (i > 0) {
          tmp += '/';
        }
        tmp += cv ? cv.name : 'n.a.';
      }
      result += tmp;
    }

    // Illustrator.
    if (character.illustrators.length > 0) {
      let tmp = ', イラスト: ';
      for (let i = 0; i < character.illustrators.length; ++i) {
        let illust = this.illustrators.find((item) => item.id === character.illustrators[i]);
        if (i > 0) {
          tmp += '/';
        }
        tmp += illust ? illust.name : 'n.a.';
      }
      result += tmp;
    }

    return result;
  }
}
