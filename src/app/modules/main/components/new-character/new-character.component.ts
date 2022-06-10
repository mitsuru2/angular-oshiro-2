import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsCharacter,
  FsCharacterType,
  FsGeographType,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FirestoreCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { CharacterTypeInNewCharacterForm, RarerityInNewCharacterForm } from './new-character-form.interface';
import { ref, Storage, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent implements OnInit {
  @ViewChild('shiromusumePreview') shiromusumePreview!: ElementRef<HTMLCanvasElement>;

  className: string = 'NewCharacterComponent';

  characterTypes!: FsCharacterType[];

  characterTypeItems!: CharacterTypeInNewCharacterForm[];

  selectedCharacterType?: CharacterTypeInNewCharacterForm;

  inputName: string = '';

  rarerityItems!: RarerityInNewCharacterForm[];

  selectedRarerity?: RarerityInNewCharacterForm;

  geographTypeItems!: FsGeographType[];

  selectedGeographTypes: FsGeographType[] = [];

  isShowSubGeographTypeInput = false;

  weaponTypeItems!: FsWeaponType[];

  selectedWeaponType?: FsWeaponType;

  shiromusumeFile?: any;

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService, private storage: Storage) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {
    this.characterTypes = this.firestore.getData(FirestoreCollectionName.CharacterTypes) as FsCharacterType[];
    this.characterTypeItems = this.makeCharacterTypeItems(this.characterTypes);
    this.rarerityItems = this.makeRarerityItems();
    this.geographTypeItems = this.firestore.getData(FirestoreCollectionName.GeographTypes) as FsGeographType[];
    this.weaponTypeItems = this.firestore.getData(FirestoreCollectionName.WeaponTypes) as FsWeaponType[];
  }

  private makeCharacterTypeItems(fsData: FsCharacterType[]): CharacterTypeInNewCharacterForm[] {
    this.logger.trace(`${this.className}.makeCharacterTypeItems()`);

    let list = [];

    for (let c of fsData) {
      let tmp: CharacterTypeInNewCharacterForm = {
        id: c.id,
        index: c.index,
        names: { ...c.names },
        count: c.count,
        longName: c.names[0],
        code: c.code,
      };
      if (c.names.length > 1) {
        tmp.longName += ' | ' + c.names[1];
      }
      list.push(tmp);
    }
    list.sort((a, b) => {
      return a.code < b.code ? -1 : 1;
    });

    return list;
  }

  private makeRarerityItems(): RarerityInNewCharacterForm[] {
    let list = [];

    for (let i = 0; i < 7; i++) {
      let tmp: RarerityInNewCharacterForm = { name: '★' + String(i + 1), value: i + 1 };
      list.push(tmp);
    }
    list.sort((a, b) => b.value - a.value);

    return list;
  }

  async submit() {
    this.logger.trace(`NewCharacterComponent.submit()`);

    this.selectedRarerity = { name: '★1', value: 1 };

    if (this.selectedCharacterType && this.selectedRarerity && this.selectedWeaponType) {
      //const count = await this.firestore.incrementCounter(FirestoreCollectionName.CharacterTypes, 0);
      const count = 1;

      const character: FsCharacter = {
        id: '', // Auto ID.
        index: `${this.selectedCharacterType.code}-${('0000' + count.toString(16).toUpperCase()).slice(-4)}`,
        name: this.inputName,
        type: this.selectedCharacterType.index,
        rarerity: this.selectedRarerity?.value,
        weaponType: this.selectedWeaponType.index,
        geographTypes: [this.selectedGeographTypes[0].index],
        region: 0,
        cost: 99,
      };
      this.logger.debug(character);

      const shiromusumeImageRef = ref(
        this.storage,
        `images/characters/${character.index}/${character.index}_shiromusume.png`
      );
      //uploadBytes(shiromusumeImageRef, this.shiromusumeFile).then((snp) => {
      //  this.logger.debug('uploaded', snp);
      //});

      //this.firestore.addData(FirestoreCollectionName.Characters, character);
    }
  }

  onFileChange(id: string, event: Event) {
    this.logger.trace(`${this.className}.onFileChange()`);

    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    this.shiromusumeFile = input.files[0];

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const canvas = this.shiromusumePreview.nativeElement as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      const image = new Image();
      image.src = fileReader.result as string;
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context?.drawImage(image, 0, 0);
      };
    };
    fileReader.readAsDataURL(input.files[0]);
  }

  clearFile(id: string) {
    this.logger.trace(`${this.className}.clearFile()`);

    this.shiromusumeFile = null;
  }

  clearInputName() {
    this.inputName = '';
  }

  setSubGeographTypeInput(isShow: boolean) {
    this.isShowSubGeographTypeInput = isShow;

    if (isShow === false) {
      if (this.selectedGeographTypes.length > 1) {
        this.selectedGeographTypes.pop();
        this.logger.info('NewCharacterCoponent.setSubGeographTypeInput() | 2nd geograph type info has been removed.');
      }
    }
  }

  shiftGeographType() {
    this.logger.trace('NewCharacterComponent.shiftGeographType()');

    if (this.selectedGeographTypes.length > 1) {
      if (this.selectedGeographTypes[1] != undefined) {
        this.selectedGeographTypes.shift();
        this.isShowSubGeographTypeInput = false;
      }
    }
  }
}
