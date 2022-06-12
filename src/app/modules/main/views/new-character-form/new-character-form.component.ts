import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsCharacterType,
  FsDocumentBaseWithCode,
  FsDocumentBase,
  FsGeographType,
  FsDocumentBaseWithNumberIndex,
  FsDocumentBaseWithOrder,
  FsRegion,
  FsWeaponType,
  FsAbilityType,
  FsAbility,
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

  geographTypeItems!: FsGeographType[];

  selectedGeographTypes: FsGeographType[] = [];

  /** Region. */
  @Input() regions!: FsRegion[];

  regionItems!: FsRegion[];

  selectedRegion?: FsRegion;

  /** Cost */
  characterCost = 0;

  characterCost_kai = 0;

  /** Ability Type */
  @Input() abilityTypes!: FsAbilityType[];

  selectedAbilityTypes: FsAbilityType[] = [];

  abilityCount = 1;

  /** Ability */
  @Input() abilities!: FsAbility[];

  filteredAbilities: FsAbility[] = [];

  inputAbilityName = '';

  inputAbilityDesc = ['', '', ''];

  keiryakuCost = 0;

  keiryakuInterval = 0;

  tokenLayoutRed = false;

  tokenLayoutBlue = false;

  /** Output character data. */
  @Output() confirmEvent = new EventEmitter<NewCharacterFormOutput>();

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
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

    this.weaponTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.weaponTypes, this.weaponTypes);
    this.firestore.sortByCode(this.weaponTypeItems);

    this.geographTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.geographTypes, this.geographTypes);
    this.firestore.sortByOrder(this.geographTypeItems);

    if (this.selectedCharacterType.regions) {
      this.regionItems = this.makeFilteredFormItems(this.selectedCharacterType.regions, this.regions);
      this.firestore.sortByOrder(this.regionItems);
    }
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

    let query = event.query;

    this.filteredAbilities = [];
    for (let i = 0; i < this.abilities.length; ++i) {
      if (this.abilities[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        this.filteredAbilities.push(this.abilities[i]);
      }
    }

    this.logger.debug(location, { query: query, items: this.filteredAbilities });
  }

  onConfirmButtonClick() {
    const location = `${this.className}.onConfirmButtonClick()`;
    this.logger.trace(location);

    if (this.selectedRarerity == undefined || this.selectedWeaponType == undefined) {
      return;
    }

    const character: NewCharacterFormOutput = {
      characterType: this.selectedCharacterType,
      characterName: this.characterName,
      rarerity: this.selectedRarerity.value,
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

  private makeCharacterTypeItems(fsData: FsCharacterType[]): CharacterTypeInNewCharacterForm[] {
    const location = `${this.className}.makeCharacterTypeItems()`;
    this.logger.trace(location);

    let list = [];

    for (let d of fsData) {
      let tmp: CharacterTypeInNewCharacterForm = d as CharacterTypeInNewCharacterForm;
      tmp.longName = d.names[0];
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

  private makeFilteredFormItems<T extends FsDocumentBaseWithNumberIndex>(filter: number[], fsData: T[]): T[] {
    const location = `${this.className}.makeFilteredFormItems()`;
    this.logger.trace(location);

    const items: T[] = [];

    // Add item if it's included in the filter.
    for (let d of fsData) {
      if (filter.includes(d.index)) {
        items.push(d);
      }
    }

    return items;
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
