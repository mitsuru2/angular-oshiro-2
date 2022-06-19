import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { deepStrictEqual } from 'assert';
import { NGXLogger } from 'ngx-logger';
import { type } from 'os';
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
import { FsAbilityForNewCharacterForm, NewCharacterFormResult } from './new-character-form.interface';

@Component({
  selector: 'app-new-character-form',
  templateUrl: './new-character-form.component.html',
  styleUrls: ['./new-character-form.component.scss'],
})
export class NewCharacterFormComponent implements OnChanges {
  private className = 'NewCharacterFormComponent';

  /** Appearance. */
  @Input() maxWidth = 'auto';

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
  inputCharacterCost = 0;

  inputCharacterCostKai = 0;

  /** Voice actor. */
  @Input() voiceActors!: FsVoiceActor[];

  suggestVoiceActorNames: string[] = [];

  inputVoiceActor: FsVoiceActor = <FsVoiceActor>{};

  /** Illustrator. */
  @Input() illustrators!: FsIllustrator[];

  suggestIllustratorNames: string[] = [];

  inputIllustrator: FsIllustrator = <FsIllustrator>{};

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

  selectedAbilityTypesKai: FsAbilityType[] = [<FsAbilityType>{}];

  /** Ability */
  @Input() abilities!: FsAbility[];

  suggestAbilityNames: string[][] = [[]];

  suggestAbilityNamesKai: string[][] = [[]];

  inputAbilities: FsAbilityForNewCharacterForm[] = [this.makeFsAbilityForNewCharacterForm()];

  inputAbilitiesKai: FsAbilityForNewCharacterForm[] = [this.makeFsAbilityForNewCharacterForm()];

  /** Output character data. */
  @Output() formResult = new EventEmitter<NewCharacterFormResult>();

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

  onAutofillInputChange(event: any) {
    const location = `${this.className}.onAutofillInputChange()`;
    this.logger.trace(location);

    const inputId = event.originalEvent.target.id;
    const query = event.query;

    // CASE: Voice actor input.
    if (inputId === 'NewCharacterForm_VoiceActorInput') {
      // Update suggestion item list.
      this.suggestVoiceActorNames = this.makeSuggestLabels(
        query,
        this.voiceActors.map((item) => item.name)
      );
    }

    // CASE: Illustrator input.
    else if (inputId === 'NewCharacterForm_IllustratorInput') {
      // Update suggestion item list.
      this.suggestIllustratorNames = this.makeSuggestLabels(
        query,
        this.illustrators.map((item) => item.name)
      );
    }

    // CASE: Ablity name input.
    else if (inputId.indexOf('NewCharacterForm_AbilityNameInput_') >= 0) {
      // Update suggestion item list.
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      this.logger.debug(location, { index: index });
      this.suggestAbilityNames[index] = this.makeSuggestLabels(
        query,
        this.abilities.map((item) => item.name)
      );

      // Clear existing flag.
      this.inputAbilities[index].isExisting = false;

      // If the input value is the same as an existing name,
      // it will do the same as if an autofill candidate was selected.
      this.onAutofillInputSelect(query, inputId);
    }

    // CASE: Ablity name input (Kai).
    else if (inputId.indexOf('NewCharacterForm_AbilityNameKaiInput_') >= 0) {
      // Update suggestion item list.
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      this.logger.debug(location, { index: index });
      this.suggestAbilityNamesKai[index] = this.makeSuggestLabels(
        query,
        this.abilities.map((item) => item.name)
      );

      // Clear existing flag.
      this.inputAbilitiesKai[index].isExisting = false;

      // If the input value is the same as an existing name,
      // it will do the same as if an autofill candidate was selected.
      this.onAutofillInputSelect(query, inputId);
    }
  }

  onAutofillInputSelect(value: any, inputId: string) {
    const location = `${this.className}.onAutoFillInputSelect()`;
    this.logger.trace(location, { value: value, inputId: inputId });

    if (inputId === 'NewCharacterForm_VoiceActorInput') {
      // Do nothing.
    } else if (inputId === 'NewCharacterForm_IllustratorInput') {
      // Do nothing.
    }

    // CASE: Ability names
    else if (inputId.indexOf('NewCharacterForm_AbilityNameInput_') >= 0) {
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      this.logger.debug(location, { index: index, value: value });

      // Search ability info and copy it to input ability info.
      for (let ability of this.abilities) {
        if (ability.name === value) {
          this.inputAbilities[index] = this.makeFsAbilityForNewCharacterForm(ability);
        }

        // Search ablity type and copy it to selected ability type.
        for (let abilityType of this.abilityTypes) {
          if (abilityType.id === this.inputAbilities[index].type) {
            this.selectedAbilityTypes[index] = abilityType;
          }
        }
      }
    }

    // CASE: Ability name (Kai)
    else if (inputId.indexOf('NewCharacterForm_AbilityNameKaiInput_') >= 0) {
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      this.logger.debug(location, { index: index, value: value });

      // Search ability info and copy it to input ability info.
      for (let ability of this.abilities) {
        if (ability.name === value) {
          this.inputAbilitiesKai[index] = this.makeFsAbilityForNewCharacterForm(ability);
        }

        // Search ablity type and copy it to selected ability type.
        for (let abilityType of this.abilityTypes) {
          if (abilityType.id === this.inputAbilitiesKai[index].type) {
            this.selectedAbilityTypesKai[index] = abilityType;
          }
        }
      }
    }
  }

  onAddAbilityButtonClick(kai: boolean) {
    const location = `${this.className}.onAddAbilityButtonClick()`;
    this.logger.trace(location, { kai: kai });

    // CASE: Before kaichiku.
    if (!kai) {
      this.selectedAbilityTypes.push(<FsAbilityType>{});
      this.suggestAbilityNames.push([]);
      this.inputAbilities.push(this.makeFsAbilityForNewCharacterForm());
    }

    // CASE: After kaichiku.
    else {
      this.selectedAbilityTypesKai.push(<FsAbilityType>{});
      this.suggestAbilityNamesKai.push([]);
      this.inputAbilitiesKai.push(this.makeFsAbilityForNewCharacterForm());
    }
  }

  onRemoveButtonoClick(kai: boolean, index: number) {
    const location = `${this.className}.onAddAbilityButtonClick()`;
    this.logger.trace(location, { kai: kai, index: index });

    // CASE: Before kaichiku.
    if (!kai) {
      this.selectedAbilityTypes.splice(index, 1);
      this.suggestAbilityNames.splice(index, 1);
      this.inputAbilities.splice(index, 1);
    }

    // CASE: After kaichiku.
    else {
      this.selectedAbilityTypesKai.splice(index, 1);
      this.suggestAbilityNamesKai.splice(index, 1);
      this.inputAbilitiesKai.splice(index, 1);
    }
  }

  onNewWeaponDialogResult(formResult: NewWeaponFormResult) {
    const location = `${this.className}.onNewWeaponDialogResult()`;
    this.logger.trace(location, { formResult: formResult });

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
    this.logger.trace(location, { formResult: formResult });

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

  onOkClick() {
    this.formResult.emit(this.makeCharacterInfo(false));
    this.clearForm();
  }

  onCancelClick() {
    this.formResult.emit(this.makeCharacterInfo(true));
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

  //============================================================================
  // Class private methods.
  //
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
    if (exceptItems.includes('voiceActor') === false) {
      this.inputVoiceActor.name = '';
    }
    if (exceptItems.includes('illustrator') === false) {
      this.inputIllustrator.name = '';
    }
    if (exceptItems.includes('motifWeapon') === false) {
      this.inputMotifWeapons = [];
    }
    if (exceptItems.includes('motifFacility') === false) {
      this.inputMotifFacilities = [];
    }
    if (exceptItems.includes('characterTag') === false) {
      this.inputCharacterTags = [];
    }
    if (exceptItems.includes('ability') === false) {
      this.selectedAbilityTypes = [<FsAbilityType>{}];
      this.selectedAbilityTypesKai = [<FsAbilityType>{}];
      this.inputAbilities = [this.makeFsAbilityForNewCharacterForm()];
      this.inputAbilitiesKai = [this.makeFsAbilityForNewCharacterForm()];
    }
  }

  private makeFsAbilityForNewCharacterForm(base?: FsAbility): FsAbilityForNewCharacterForm {
    const result: FsAbilityForNewCharacterForm = {
      id: '',
      name: '',
      type: '',
      descriptions: ['', '', ''],
      keiryakuInterval: 0,
      keiryakuCost: 0,
      tokenLayouts: ['', ''],
      tokenAvailable: false,
      isExisting: false,
    };

    if (base) {
      result.id = base.id;
      result.type = base.type;
      result.name = base.name;
      for (let i = 0; i < base.descriptions.length; ++i) {
        result.descriptions[i] = base.descriptions[i];
      }
      result.keiryakuInterval = base.keiryakuInterval ? base.keiryakuInterval : 0;
      result.keiryakuCost = base.keiryakuCost ? base.keiryakuCost : 0;
      if (base.tokenLayouts) {
        result.tokenLayouts = ['', ''];
        for (let i = 0; i < base.tokenLayouts.length; ++i) {
          result.tokenLayouts[i] = base.tokenLayouts[i];
        }
      }
      result.tokenAvailable = base.tokenLayouts ? true : false;
      result.isExisting = true;
    }

    return result;
  }

  private makeSuggestLabels(value: string, source: string[]): string[] {
    const suggests: string[] = [];

    for (let i = 0; i < source.length; ++i) {
      if (source[i].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        suggests.push(source[i]);
      }
    }

    return suggests;
  }

  private makeCharacterInfo(canceled: boolean): NewCharacterFormResult {
    const location = `${this.className}.makeCharacterInfo()`;
    const result: NewCharacterFormResult = <NewCharacterFormResult>{};

    // When the form is canceled, it returns canceled flag only.
    if (canceled) {
      result.canceled = true;
    }

    // When the form is input, it returns input weapon data.
    else {
      // The mandatory input fields must not be null or undefined.
      // Input value validation shall be implemented at template.
      if (
        !this.selectedCharacterType ||
        this.inputCharacterName === '' ||
        !this.selectedRarerity ||
        !this.selectedWeaponType ||
        !this.selectedGeographTypes
      ) {
        this.logger.error(location, 'Necessary field is not input.', {
          type: this.selectedCharacterType,
          name: this.inputCharacterName,
          rarerity: this.selectedRarerity,
          weapon: this.selectedWeaponType,
          geographType: this.selectedGeographTypes,
        });
        throw Error(`${location} Necessary field is not input.`);
      }

      // Make character data to be returned.
      // Cancel flag.
      result.canceled = false;

      // Type, name, rarerity, weapon type, geograph type, and region.
      result.characterType = this.selectedCharacterType;
      result.characterName = this.inputCharacterName;
      result.rarerity = this.selectedRarerity;
      result.weaponType = this.selectedWeaponType;
      result.geographTypes = this.selectedGeographTypes;
      result.region = this.selectedRegion;

      // Character cost.
      result.cost = this.calcCharacterCost(
        this.selectedCharacterType,
        this.selectedWeaponType,
        this.inputAbilities,
        this.inputAbilitiesKai,
        false
      ) as number;
      result.costKai = this.calcCharacterCost(
        this.selectedCharacterType,
        this.selectedWeaponType,
        this.inputAbilities,
        this.inputAbilitiesKai,
        true
      );

      // Voice actor.
      let voiceActor: FsVoiceActor = { id: '', name: this.inputVoiceActor.name };
      for (let i = 0; i < this.voiceActors.length; ++i) {
        if (this.inputVoiceActor.name === this.voiceActors[i].name) {
          voiceActor = this.voiceActors[i];
          break;
        }
      }
      result.voiceActors = [];
      result.voiceActors.push(voiceActor);

      // Illustrator.
      let illustrator: FsIllustrator = { id: '', name: this.inputIllustrator.name };
      for (let i = 0; i < this.illustrators.length; ++i) {
        if (this.inputIllustrator.name === this.illustrators[i].name) {
          illustrator = this.illustrators[i];
          break;
        }
      }
      result.illustrators = [];
      result.illustrators.push(illustrator);

      // Motif weapon.
      result.motifWeapons = [];
      for (let i = 0; i < this.inputMotifWeapons.length; ++i) {
        result.motifWeapons.push(this.getWeaponDataFromInputText(this.inputMotifWeapons[i]));
      }

      // Motif facility.
      result.motifFacilities = [];
      for (let i = 0; i < this.inputMotifFacilities.length; ++i) {
        result.motifFacilities.push(this.getFacilityDataFromInputText(this.inputMotifFacilities[i]));
      }

      // Character tag.
      result.characterTags = [];
      for (let i = 0; i < this.inputCharacterTags.length; ++i) {
        result.characterTags.push(this.getCharacterTagDataFromInputText(this.inputCharacterTags[i]));
      }
    }

    return result;
  }

  private calcCharacterCost(
    characterType: FsCharacterType,
    weaponType: FsWeaponType,
    abilities: FsAbility[],
    abilitiesKai: FsAbility[],
    kaichiku: boolean
  ): number | undefined {
    const location = `${this.className}.calcCharacterCost()`;

    // Precondition.
    // If the character type doesn't support kaichiku and 'kai' is TRUE,
    // it returns undefined.
    if (kaichiku && !characterType.isKaichikuEnable) {
      return undefined;
    }

    // CASE: Cost calcuration is disable.
    // It returns input cost value.
    if (!characterType.isCostCalcEnable) {
      if (!kaichiku) {
        return this.inputCharacterCost;
      } else {
        return this.inputCharacterCostKai;
      }
    }

    // CASE: Cost calcuration is enable.
    // Get the base cost from weapon type.
    let cost = weaponType.baseCost;

    // Get keyryaku id.
    let keiryakuTypeId = '';
    for (let abilityType of this.abilityTypes) {
      if (abilityType.name === '計略') {
        keiryakuTypeId = abilityType.id;
      }
    }
    if (keiryakuTypeId === '') {
      this.logger.error(location, 'Keiryaku is not found in ability type data.');
      throw Error('Keiryaku is not found in ability type data.');
    }

    // Check the character has keiryaku or not.
    let hasKeiryaku = false;
    let hasKeiryakuKai = false;
    for (let ability of abilities) {
      if (ability.type === keiryakuTypeId) {
        hasKeiryaku = true;
        break;
      }
    }
    for (let ability of abilitiesKai) {
      if (ability.type === keiryakuTypeId) {
        hasKeiryakuKai = true;
        break;
      }
    }

    // Calculate character cost.
    if (hasKeiryaku) {
      cost += 2;
    } else if (hasKeiryakuKai) {
      cost += 1;
    }
    if (kaichiku) {
      cost -= 1;
    }

    return cost;
  }

  private getWeaponDataFromInputText(text: string): FsWeapon {
    //const location = `${this.className}.getWeaponDataFromInputText()`;
    let weapon: FsWeapon = <FsWeapon>{};
    let name: string = text;

    // Get weapon info from input text
    // if the input text has separater character "|".
    if (text.indexOf('|') >= 0) {
      // Split text.
      const tokens = text.split('|');
      if (tokens.length !== 3) {
        this.logger.error(location, 'Invalid format text.', { text: text });
        throw Error(`${location} Invalid format text. ${{ text: text }}`);
      }
      const rarerity = Number(tokens[0]);
      const typeName = tokens[1];
      name = tokens[2];

      // Make weapon info.
      weapon.id = '';
      weapon.name = name;
      weapon.rarerity = rarerity;
      weapon.descriptions = [];
      weapon.attack = 0;
      for (let i = 0; i < this.weaponTypes.length; ++i) {
        if (typeName === this.weaponTypes[i].name) {
          weapon.type = this.weaponTypes[i].id;
          break;
        }
      }
    }

    // Check if the input weapon name is existing or not.
    for (let i = 0; i < this.weapons.length; ++i) {
      if (name === this.weapons[i].name) {
        weapon = this.weapons[i];
        break;
      }
    }

    return weapon;
  }

  private getFacilityDataFromInputText(text: string): FsFacility {
    const location = `${this.className}.getFacilityDataFromInputText()`;
    let facility: FsFacility = <FsFacility>{};
    let name: string = text;

    // Get facility info from input text
    // if the input text has separater character "|".
    if (text.indexOf('|') >= 0) {
      // Split text.
      const tokens = text.split('|');
      if (tokens.length !== 3) {
        this.logger.error(location, 'Invalid format text.', { text: text });
        throw Error(`${location} Invalid format text. ${{ text: text }}`);
      }
      const rarerity = Number(tokens[0]);
      const typeName = tokens[1];
      name = tokens[2];

      // Make facility info.
      facility.id = '';
      facility.name = name;
      facility.rarerity = rarerity;
      for (let i = 0; i < this.facilityTypes.length; ++i) {
        if (typeName === this.facilityTypes[i].name) {
          facility.type = this.facilityTypes[i].id;
          break;
        }
      }
    }

    // Check if the input facility name is existing or not.
    for (let i = 0; i < this.facilities.length; ++i) {
      if (name === this.facilities[i].name) {
        facility = this.facilities[i];
        break;
      }
    }

    return facility;
  }

  private getCharacterTagDataFromInputText(text: string): FsCharacterTag {
    const location = `${this.className}.getCharacterTagDataFromInputText()`;
    let tag: FsCharacterTag = <FsCharacterTag>{};
    let name: string = text;

    // Get tag info from input text
    // if the input text has separater character "|".
    if (text.indexOf('|') >= 0) {
      // Split text.
      const tokens = text.split('|');
      if (tokens.length !== 2) {
        this.logger.error(location, 'Invalid format text.', { text: text });
        throw Error(`${location} Invalid format text. ${{ text: text }}`);
      }
      name = tokens[0];

      // Make tag info.
      tag.id = '';
      tag.name = name;
      tag.characters = [];
    }

    // Check if the input weapon name is existing or not.
    for (let i = 0; i < this.characterTags.length; ++i) {
      if (name === this.characterTags[i].name) {
        tag = this.characterTags[i];
        break;
      }
    }

    return tag;
  }
}
