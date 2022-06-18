import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { deepStrictEqual } from 'assert';
import { NGXLogger } from 'ngx-logger';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsCharacterType,
  FsDocumentBase,
  FsGeographType,
  FsRegion,
  FsWeaponType,
  FsAbilityType,
  FsAbility,
  FsVoiceActor,
  FsIllustrator,
  FsWeapon,
  FsFacility,
  FsFacilityType,
  FsCharacterRarerityMax,
  FsCharacterTag,
  FsSubCharacterType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { facilityFormMode, NewFacilityFormResult } from '../new-facility-form/new-facility-form.interafce';
import { NewWeaponFormMode, NewWeaponFormResult } from '../new-weapon-form/new-weapon-form.interface';
import { FsAbilityForNewCharacterForm, NewCharacterFormOutput } from './new-character-form.interface';

@Component({
  selector: 'app-new-character-form',
  templateUrl: './new-character-form.component.html',
  styleUrls: ['./new-character-form.component.scss'],
})
export class NewCharacterFormComponent implements OnChanges {
  private className = 'NewCharacterFormComponent';

  /** Appearance. */
  @Input() maxWidth = '1000px';

  iconButtonWidth = 50; // px

  /** Button label and style. */
  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Character Type */
  @Input() characterTypes!: FsCharacterType[];

  selectedCharacterType!: FsCharacterType;

  selectedSubCharacterType?: FsSubCharacterType;

  /** Character Name */
  inputCharacterName = '';

  /** Rearity */
  rarerityItems: number[] = [];

  selectedRarerity?: number;

  /** Weapon Type */
  @Input() weaponTypes!: FsWeaponType[];

  weaponTypeItems!: FsWeaponType[];

  selectedWeaponType?: FsWeaponType;

  /** Geograph type. */
  @Input() geographTypes!: FsGeographType[];

  geographTypeItems!: FsGeographType[];

  selectedGeographTypes: FsGeographType[] = [];

  /** Region. */
  @Input() regions!: FsRegion[];

  regionItems!: FsRegion[];

  selectedRegion?: FsRegion;

  /** Cost */
  characterCost = 0;

  characterCost_kai = 0;

  /** Voice actor. */
  @Input() voiceActors!: FsVoiceActor[];

  filteredVoiceActors: FsVoiceActor[] = [];

  inputVoiceActor: FsVoiceActor = <FsVoiceActor>{ name: '' };

  /** Illustrator. */
  @Input() illustrators!: FsIllustrator[];

  filteredIllustrators: FsIllustrator[] = [];

  inputIllustrator: FsIllustrator = <FsIllustrator>{ name: '' };

  /** Motif weapons */
  @Input() weapons!: FsWeapon[];

  inputMotifWeapons: string[] = [];

  /** New weapon form. */
  weaponFormMode = NewWeaponFormMode.minimum;

  initialWeaponName = '';

  showWeaponForm = false;

  /** Motif facilities. */
  @Input() facilities!: FsFacility[];

  inputMotifFacilities: string[] = [];

  /** New facility form. */
  @Input() facilityTypes!: FsFacilityType[];

  facilityFormMode = facilityFormMode.minimum;

  initialFacilityName = '';

  showFacilityForm = false;

  /** Tags. */
  @Input() characterTags!: FsCharacterTag[];

  inputCharacterTags: string[] = [];

  /** Ability Type */
  @Input() abilityTypes!: FsAbilityType[];

  selectedAbilityTypes: FsAbilityType[] = [<FsAbilityType>{}];

  /** Ability */
  @Input() abilities!: FsAbility[];

  filteredAbilities: string[][] = [[]];

  inputAbilities: FsAbilityForNewCharacterForm[] = [
    <FsAbilityForNewCharacterForm>{
      descriptions: ['', '', ''],
    },
  ];

  /** Output character data. */
  @Output() confirmEvent = new EventEmitter<NewCharacterFormOutput>();

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize rarerity list.
    for (let i = 0; i < FsCharacterRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnChanges(): void {
    // Character type.
    this.firestore.sortByCode(this.characterTypes);
    this.selectedCharacterType = this.characterTypes[0];

    // Sub character type.
    for (let i = 0; i < this.characterTypes.length; ++i) {
      if (this.characterTypes[i].subTypes) {
        this.firestore.sortByCode(this.characterTypes[i].subTypes as FsSubCharacterType[]);
      }
    }

    // Weapon type.
    this.weaponTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.weaponTypes, this.weaponTypes);
    this.firestore.sortByCode(this.weaponTypeItems);

    // Geograph type.
    this.geographTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.geographTypes, this.geographTypes);
    this.firestore.sortByOrder(this.geographTypeItems);

    // Region.
    if (this.selectedCharacterType.regions) {
      this.regionItems = this.makeFilteredFormItems(this.selectedCharacterType.regions, this.regions);
      this.firestore.sortByOrder(this.regionItems);
    }

    // Ability type.
    this.firestore.sortByOrder(this.abilityTypes);
  }

  onCharacterTypeChanged() {
    this.logger.trace(`${this.className}.onCharacterTypeChanged()`);

    // Clear form except character type.
    this.clearForm(['characterType']);

    // Update weapon type item list.
    this.weaponTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.weaponTypes, this.weaponTypes);
    this.firestore.sortByCode(this.weaponTypeItems);
    if (this.weaponTypeItems.length === 1) {
      this.selectedWeaponType = this.weaponTypeItems[0];
    }

    // Update geograph type item list.
    this.geographTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.geographTypes, this.geographTypes);
    this.firestore.sortByOrder(this.geographTypeItems);
    if (this.geographTypeItems.length === 1) {
      this.selectedGeographTypes = [this.geographTypeItems[0]];
    }

    // Update region item list.
    if (this.selectedCharacterType.regions) {
      this.regionItems = this.makeFilteredFormItems(this.selectedCharacterType.regions, this.regions);
      this.firestore.sortByOrder(this.regionItems);
      if (this.regionItems.length === 1) {
        this.selectedRegion = this.regionItems[0];
      }
    }
  }

  onAutofillInputChange(event: any) {
    const location = `${this.className}.onAutofillInputChange()`;
    this.logger.trace(location);

    const inputId = event.originalEvent.target.id;
    const query = event.query;
    let items: any;

    if (inputId === 'NewCharacterForm_VoiceActorInput') {
      this.filteredVoiceActors = [];
      for (let i = 0; i < this.voiceActors.length; ++i) {
        if (this.voiceActors[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          this.filteredVoiceActors.push(this.voiceActors[i]);
        }
      }
      items = this.filteredVoiceActors;
    } else if (inputId === 'NewCharacterForm_IllustratorInput') {
      this.filteredIllustrators = [];
      for (let i = 0; i < this.illustrators.length; ++i) {
        if (this.illustrators[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          this.filteredIllustrators.push(this.illustrators[i]);
        }
      }
      items = this.filteredIllustrators;
    } else if (inputId.indexOf('NewCharacterForm_AbilityNameInput_') >= 0) {
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      this.logger.debug(location, { index: index });
      this.filteredAbilities[index] = [];
      for (let i = 0; i < this.abilities.length; ++i) {
        if (this.abilities[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          this.filteredAbilities[index].push(this.abilities[i].name);
        }
      }
      items = this.filteredAbilities[index];

      // Clear existing flag.
      this.inputAbilities[index].isExisting = false;
    }

    this.logger.debug(location, { inputId: inputId, query: query, items: items });
  }

  onAutofillInputSelect(value: any, inputId: string) {
    const location = `${this.className}.onAutoFillInputSelect()`;
    this.logger.trace(location);

    //const inputId = event.originalEvent.target.id;

    if (inputId === 'NewCharacterForm_VoiceActorInput') {
    } else if (inputId === 'NewCharacterForm_IllustratorInput') {
    } else if (inputId.indexOf('NewCharacterForm_AbilityNameInput_') >= 0) {
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      const dest = this.inputAbilities[index];
      this.logger.debug(location, { index: index, value: value });

      // Search ability info and copy it to input ability info.
      for (let ability of this.abilities) {
        if (ability.name === value) {
          dest.id = ability.id;
          dest.type = ability.type;
          dest.name = ability.name;
          for (let i = 0; i < ability.descriptions.length; ++i) {
            dest.descriptions[i] = ability.descriptions[i];
          }
          dest.keiryakuCost = ability.keiryakuCost;
          dest.keiryakuInterval = ability.keiryakuInterval;
          dest.tokenAvailable = ability.tokenLayouts ? true : false;
          if (ability.tokenLayouts) {
            dest.tokenLayouts = [];
            for (let i = 0; i < ability.tokenLayouts?.length; ++i) {
              dest.tokenLayouts[i] = ability.tokenLayouts[i];
            }
          }
          dest.isExisting = true;
        }

        // Search ablity type and copu it to selected ability type.
        for (let abilityType of this.abilityTypes) {
          if (abilityType.id === dest.type) {
            this.selectedAbilityTypes[index] = abilityType;
          }
        }
      }
    }
  }

  onChipInputAdd(event: any) {
    const location = `${this.className}.onChipInputAdd()`;
    this.logger.trace(location);

    const inputId = event.originalEvent.target.id;
    let value = event.value;

    // Switch process by target input element.
    // Case: Motif weapon.
    if (inputId === 'NewCharacterForm_MotifWeaponInput') {
      this.onMotifWeaponInputAdd('NewCharacterForm_MotifFacilityInput', value);
    }

    // Case: Motif facility.
    else if (inputId === 'NewCharacterForm_MotifFacilityInput') {
      this.onMotifFacilityInputAdd('NewCharacterForm_MotifFacilityInput', value);
    }

    // Case: Character tags.
    else if (inputId === 'NewCharacterForm_CharacterTagInput') {
      this.onCharacterTagInputAdd('NewCharacterForm_CharacterTagInput', value);
    }
  }

  onOkClick() {
    this.logger.debug(this.inputAbilities);
    //this.formResult.emit(this.makeWeaponInfo(false));
    //this.clearInputs();
  }

  onCancelClick() {
    //this.formResult.emit(this.makeWeaponInfo(true));
    //this.clearInputs();
  }

  private onMotifWeaponInputAdd(inputId: string, value: string) {
    // Get index.
    const index = this.inputMotifWeapons.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not included in the binded variable.', { inputId: inputId });
      throw Error(`Input text is not included in the binded variable. { inputId: ${inputId} }`);
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputMotifWeapons[index] = value;
    }

    // Open new weapon form if input motif weapon name is new.
    if (this.facilities.findIndex((item) => item.name === value) < 0) {
      this.inputMotifWeapons.splice(index);
      this.initialWeaponName = value;
      this.showWeaponForm = true;
    }
  }

  private onMotifFacilityInputAdd(inputId: string, value: string) {
    // Get index.
    const index = this.inputMotifFacilities.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not included in the binded variable.', { inputId: inputId });
      throw Error(`Input text is not included in the binded variable. { inputId: ${inputId} }`);
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputMotifFacilities[index] = value;
    }

    // Open new weapon form if input motif weapon name is new.
    if (this.facilities.findIndex((item) => item.name === value) < 0) {
      this.inputMotifFacilities.splice(index);
      this.initialFacilityName = value;
      this.showFacilityForm = true;
    }
  }

  private onCharacterTagInputAdd(inputId: string, value: string) {
    // Get index.
    const index = this.inputCharacterTags.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not included in the binded variable.', { inputId: inputId });
      throw Error(`Input text is not included in the binded variable. { inputId: ${inputId} }`);
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputCharacterTags[index] = value;
    }

    // Add '|new' to the added token if it's new character tag.
    if (this.characterTags.findIndex((item) => item.name === value) < 0) {
      this.inputCharacterTags[index] += '|new';
    }
  }

  onNewWeaponDialogResult(formResult: NewWeaponFormResult) {
    const location = `${this.className}.onNewWeaponDialogResult()`;
    this.logger.trace(location);

    this.logger.debug(location, formResult);

    // Import form result to motif weapon field.
    if (!formResult.canceled) {
      const weaponText = `${formResult.rarerity.toString()}|${formResult.type.name}|${formResult.name}`;
      this.inputMotifWeapons.push(weaponText);
    }

    // Reset GUI focus to the motif weapon input.
    const element = document.getElementById('NewCharacterForm_MotifWeaponInput');
    if (element != undefined) {
      element.focus();
    }

    // Close dialog.
    this.showWeaponForm = false;
  }

  onNewFacilityFormResult(formResult: NewFacilityFormResult) {
    const location = `${this.className}.onNewFacilityFormResult()`;
    this.logger.trace(location);

    this.logger.debug(location, formResult);

    // Import form result to motif weapon field.
    if (!formResult.canceled) {
      const facilityText = `${formResult.rarerity.toString()}|${formResult.type.name}|${formResult.name}`;
      this.inputMotifFacilities.push(facilityText);
    }

    // Reset GUI focus to the motif weapon input.
    const element = document.getElementById('NewCharacterForm_MotifFacilityInput');
    if (element != undefined) {
      element.focus();
    }

    // Close dialog.
    this.showFacilityForm = false;
  }

  onConfirmButtonClick() {
    const location = `${this.className}.onConfirmButtonClick()`;
    this.logger.trace(location);

    if (this.selectedRarerity == undefined || this.selectedWeaponType == undefined) {
      return;
    }

    const character: NewCharacterFormOutput = {
      characterType: this.selectedCharacterType,
      characterName: this.inputCharacterName,
      rarerity: this.selectedRarerity,
      weaponType: this.selectedWeaponType,
      geographTypes: this.selectedGeographTypes,
      cost: 0,
    };

    if (this.selectedRegion != undefined) {
      character.region = this.selectedRegion;
    }

    this.updateCharacterCost(character);

    this.logger.debug(location, character);

    this.confirmEvent.emit(character);

    this.clearForm();
  }

  /**
   * Track function which is used by *ngFor directive.
   * *ngFor cannot calculate index number when it's used with [(ngModel)].
   * So, this function help *ngFor to calculate index.
   * @param index Item index.
   * @param obj List object. Not used.
   * @returns Item index.
   */
  trackByItem(index: number, obj: any): any { // eslint-disable-line
    return index;
  }

  private makeFilteredFormItems<T extends FsDocumentBase>(filter: string[], fsData: T[]): T[] {
    const location = `${this.className}.makeFilteredFormItems2()`;
    this.logger.trace(location);

    const items: T[] = [];

    // Add item if it's included in the filter.
    for (let d of fsData) {
      if (filter.includes(d.id)) {
        items.push(d);
      }
    }

    return items;
  }

  private clearForm(exceptItems: string[] = []) {
    const location = `${this.className}.clearAll()`;
    this.logger.trace(location);

    if (exceptItems.includes('characterType') === false) {
      this.selectedCharacterType = this.characterTypes[0];
    }
    if (exceptItems.includes('subCharacterType') === false) {
      this.selectedSubCharacterType = undefined;
    }
    if (exceptItems.includes('characterName') === false) {
      this.inputCharacterName = '';
    }
    if (exceptItems.includes('rarerity') === false) {
      this.selectedRarerity = undefined;
    }
    if (exceptItems.includes('weaponType') === false) {
      this.selectedWeaponType = undefined;
    }
    if (exceptItems.includes('geographType') === false) {
      this.selectedGeographTypes = [];
    }
    if (exceptItems.includes('region') === false) {
      this.selectedRegion = undefined;
    }
  }

  private updateCharacterCost(character: NewCharacterFormOutput) {
    if (character.characterType.isCostCalcEnable) {
      character.cost = character.weaponType.baseCost;
      if (character.characterType.isKaichikuEnable) {
        character.cost_kai = character.cost - 1;
      }
    } else {
      character.cost = this.characterCost;
      if (character.characterType.isKaichikuEnable) {
        character.cost_kai = this.characterCost_kai;
      }
    }
  }
}
