import { Component, Directive, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterType,
  FsGeographType,
  FsRegion,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FirestoreCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import {
  CharacterTypeInNewCharacterForm,
  RarerityInNewCharacterForm,
} from '../../views/new-character-form/new-character-form.interface';
import { ref, Storage, uploadBytes } from '@angular/fire/storage';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent implements OnInit {
  @ViewChild('shiromusumePreview') shiromusumePreview!: ElementRef<HTMLCanvasElement>;

  className: string = 'NewCharacterComponent';

  characterTypes!: FsCharacterType[];

  selectedCharacterType?: CharacterTypeInNewCharacterForm;

  inputName: string = '';

  rarerityItems!: RarerityInNewCharacterForm[];

  selectedRarerity?: RarerityInNewCharacterForm;

  geographTypes!: FsGeographType[];

  selectedGeographTypes: FsGeographType[] = [];

  isShowSubGeographTypeInput = false;

  weaponTypes!: FsWeaponType[];

  selectedWeaponType?: FsWeaponType;

  regions!: FsRegion[];

  abilityTypes!: FsAbilityType[];

  abilities!: FsAbility[];

  shiromusumeFile?: File | null;

  isPlusGeographTypeButtonActive = false;

  isDialogShow = false;

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService, private storage: Storage) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {
    this.characterTypes = this.firestore.getData(FirestoreCollectionName.CharacterTypes) as FsCharacterType[];
    this.geographTypes = this.firestore.getData(FirestoreCollectionName.GeographTypes) as FsGeographType[];
    this.weaponTypes = this.firestore.getData(FirestoreCollectionName.WeaponTypes) as FsWeaponType[];
    this.regions = this.firestore.getData(FirestoreCollectionName.Regions) as FsRegion[];
    this.abilityTypes = this.firestore.getData(FirestoreCollectionName.AbilityTypes) as FsAbilityType[];
    this.abilities = this.firestore.getData(FirestoreCollectionName.Abilities) as FsAbility[];
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

  showDialog() {
    this.logger.trace('showDialog()');
    this.isDialogShow = true;
  }

  hideDialog() {
    this.isDialogShow = false;
    this.logger.trace('hideDialog()');
  }

  printStatus() {
    this.logger.debug(this.isDialogShow);
  }
}
