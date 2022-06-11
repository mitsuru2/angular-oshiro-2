import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsCharacterType,
  FsGeographType,
  FsRegion,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import {
  CharacterTypeInNewCharacterForm,
  NewCharacterFormOutput,
  RarerityInNewCharacterForm,
} from './new-character-form.interface';

@Component({
  selector: 'app-new-character-form',
  templateUrl: './new-character-form.component.html',
  styleUrls: ['./new-character-form.component.scss'],
})
export class NewCharacterFormComponent implements OnInit {
  private className = 'NewCharacterFormComponent';

  /** Character Type */
  @Input() characterTypes!: FsCharacterType[];

  characterTypeItems!: CharacterTypeInNewCharacterForm[];

  selectedCharacterType!: CharacterTypeInNewCharacterForm;

  /** Character Name */
  characterName = '';

  /** Rearity */
  rarerityItems!: RarerityInNewCharacterForm[];

  selectedRarerity?: RarerityInNewCharacterForm;

  /** Weapon Type */
  @Input() weaponTypes!: FsWeaponType[];

  weaponTypeItems!: FsWeaponType[];

  selectedWeaponType?: FsWeaponType;

  /** Geograph type. */
  @Input() geographTypes!: FsGeographType[];

  selectedGeographTypes!: FsGeographType[];

  /** Region. */
  @Input() regions!: FsRegion[];

  selectedRegion?: FsRegion;

  /** Cost */
  characterCost = 0;

  characterCost_kai = 0;

  /** Output character data. */
  @Output() confirmEvent = new EventEmitter<NewCharacterFormOutput>();

  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {
    // Initialize selected values of input controls.
    this.characterTypeItems = this.makeCharacterTypeItems(this.characterTypes);
    this.selectedCharacterType = this.characterTypeItems[0];

    this.rarerityItems = [];
    for (let i = 0; i < 7; ++i) {
      this.rarerityItems.push({ name: '★' + (i + 1).toString(), value: i + 1 });
    }

    this.weaponTypeItems = this.makeWeaponTypeItems(this.selectedCharacterType, this.weaponTypes);

    this.selectedGeographTypes = [];
  }

  onCharacterTypeChanged() {
    this.logger.trace(`${this.className}.onCharacterTypeChanged()`);

    // Update weapon type item list.
    this.weaponTypeItems = this.makeWeaponTypeItems(this.selectedCharacterType, this.weaponTypes);
    this.selectedWeaponType = undefined;

    // Clear form except character type.
    this.clearForm(['characterType']);
  }

  onConfirmButtonClick() {
    const location = `${this.className}.onConfirmButtonClick()`;
    this.logger.trace(location);

    if (
      this.selectedRarerity == undefined ||
      this.selectedWeaponType == undefined ||
      this.selectedRegion == undefined
    ) {
      return;
    }

    const character: NewCharacterFormOutput = {
      characterType: {
        id: this.selectedCharacterType.id,
        index: this.selectedCharacterType.index,
        code: this.selectedCharacterType.code,
        names: this.selectedCharacterType.names.slice(),
        weaponTypes: this.selectedCharacterType.weaponTypes.slice(),
        hasRegion: this.selectedCharacterType.hasRegion,
        isCostCalcEnable: this.selectedCharacterType.isCostCalcEnable,
        isKaichikuEnable: this.selectedCharacterType.isKaichikuEnable,
        count: this.selectedCharacterType.count,
      },
      characterName: this.characterName,
      rarerity: this.selectedRarerity.value,
      weaponType: this.selectedWeaponType,
      geographTypes: this.selectedGeographTypes,
      region: this.selectedRegion,
      cost: 0,
    };

    this.updateCharacterCost(character);

    this.logger.debug(location, character);

    this.confirmEvent.emit(character);

    this.clearForm();
  }

  private makeCharacterTypeItems(fsData: FsCharacterType[]): CharacterTypeInNewCharacterForm[] {
    const location = `${this.className}.makeCharacterTypeItems()`;
    this.logger.trace(location);

    let list = [];

    for (let d of fsData) {
      let tmp: CharacterTypeInNewCharacterForm = {
        id: d.id,
        index: d.index,
        names: d.names.slice(),
        count: d.count,
        longName: d.names[0],
        weaponTypes: d.weaponTypes.slice(),
        hasRegion: d.hasRegion,
        isCostCalcEnable: d.isCostCalcEnable,
        isKaichikuEnable: d.isKaichikuEnable,
        code: d.code,
      };
      if (d.names.length > 1) {
        tmp.longName += ' | ' + d.names[1];
      }
      list.push(tmp);
    }
    list.sort((a, b) => {
      return a.code < b.code ? -1 : 1;
    });

    this.logger.debug(location, list);

    return list;
  }

  private makeWeaponTypeItems(characterType: CharacterTypeInNewCharacterForm, fsData: FsWeaponType[]): FsWeaponType[] {
    const location = `${this.className}.makeWeaponTypeItems()`;
    this.logger.trace(location, { type: characterType.longName });

    const weaponTypes: FsWeaponType[] = [];

    for (let d of fsData) {
      if (characterType.weaponTypes.includes(d.index)) {
        weaponTypes.push(d);
      }
    }
    weaponTypes.sort((a, b) => a.index - b.index);

    this.logger.debug(location, weaponTypes);

    return weaponTypes;
  }

  private clearForm(exceptItems: string[] = []) {
    const location = `${this.className}.clearAll()`;
    this.logger.trace(location);

    if (exceptItems.includes('characterType') === false) {
      this.selectedCharacterType = this.characterTypeItems[0];
    }
    if (exceptItems.includes('characterName') === false) {
      this.characterName = '';
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
      character.cost_kai = character.cost - 1;
    } else {
      character.cost = this.characterCost;
      if (character.characterType.isKaichikuEnable) {
        character.cost_kai = this.characterCost_kai;
      }
    }
  }
}
