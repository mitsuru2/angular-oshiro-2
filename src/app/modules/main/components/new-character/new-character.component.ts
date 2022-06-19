import { Component, Directive, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterTag,
  FsCharacterType,
  FsFacility,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { ref, Storage, uploadBytes } from '@angular/fire/storage';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { NewCharacterFormResult } from '../../views/new-character-form/new-character-form.interface';

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent implements OnInit {
  @ViewChild('shiromusumePreview') shiromusumePreview!: ElementRef<HTMLCanvasElement>;

  className: string = 'NewCharacterComponent';

  characterTypes!: FsCharacterType[];

  characterTags!: FsCharacterTag[];

  inputName: string = '';

  selectedRarerity: number = 1;

  geographTypes!: FsGeographType[];

  selectedGeographTypes: FsGeographType[] = [];

  isShowSubGeographTypeInput = false;

  weaponTypes!: FsWeaponType[];

  selectedWeaponType?: FsWeaponType;

  regions!: FsRegion[];

  voiceActors!: FsVoiceActor[];

  illustrators!: FsIllustrator[];

  weapons!: FsWeapon[];

  facilityTypes!: FsFacilityType[];

  facilities!: FsFacility[];

  abilityTypes!: FsAbilityType[];

  abilities!: FsAbility[];

  shiromusumeFile?: File | null;

  isPlusGeographTypeButtonActive = false;

  isDialogShow = false;

  /** New character form. */
  newCharacterFormResult?: NewCharacterFormResult;

  /** New character confirmation dialog. */
  showConfirmationDialog = false;

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService, private storage: Storage) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {
    this.characterTypes = this.firestore.getData(FsCollectionName.CharacterTypes) as FsCharacterType[];
    this.characterTags = this.firestore.getData(FsCollectionName.CharacterTags) as FsCharacterTag[];
    this.geographTypes = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];
    this.weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];
    this.weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeapon[];
    this.facilities = this.firestore.getData(FsCollectionName.Facilities) as FsFacility[];
    this.facilityTypes = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];
    this.regions = this.firestore.getData(FsCollectionName.Regions) as FsRegion[];
    this.voiceActors = this.firestore.getData(FsCollectionName.VoiceActors) as FsVoiceActor[];
    this.illustrators = this.firestore.getData(FsCollectionName.Illustrators) as FsIllustrator[];
    this.abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];
    this.abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];
  }

  onNewCharacterFormResult(formResult: NewCharacterFormResult) {
    const location = `${this.className}.onNewCharacterFormResult()`;
    this.logger.trace(location, { formResult: formResult });

    /** If valid data input, open the confirmation dialog. */
    if (!formResult.canceled) {
      this.newCharacterFormResult = formResult;
      this.showConfirmationDialog = true;
    }
  }

  onNewCharacterConfirmResult(result: boolean) {
    const location = `${this.className}.onNewCharacterConfirmResult()`;
    this.logger.trace(location, { confirmationResult: result });

    // Close dialog.
    this.showConfirmationDialog = false;
  }

  /**
   * Old codes from here.
   */

  async submit() {
    this.logger.trace(`NewCharacterComponent.submit()`);

    if (this.selectedRarerity && this.selectedWeaponType) {
      //const count = await this.firestore.incrementCounter(FsCollectionName.CharacterTypes, 0);
      const count = 1;

      const character: FsCharacter = {
        id: '', // Auto ID.
        index: `10-${('0000' + count.toString(16).toUpperCase()).slice(-4)}`,
        name: this.inputName,
        type: 'this.selectedCharacterType.id',
        rarerity: this.selectedRarerity,
        weaponType: this.selectedWeaponType.id,
        geographTypes: [this.selectedGeographTypes[0].id],
        region: '',
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

      //this.firestore.addData(FsCollectionName.Characters, character);
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
