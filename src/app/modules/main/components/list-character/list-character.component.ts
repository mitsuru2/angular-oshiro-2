import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsAbilityType,
  FsFacility,
  FsFacilityType,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { NewCharacterFormResult } from '../../views/new-character-form/new-character-form.interface';
import { NewFacilityFormResult } from '../../views/new-facility-form/new-facility-form.interafce';
import { NewWeaponFormResult } from '../../views/new-weapon-form/new-weapon-form.interface';

@Component({
  selector: 'app-list-character',
  templateUrl: './list-character.component.html',
  styleUrls: ['./list-character.component.scss'],
})
export class ListCharacterComponent implements OnInit {
  abilityTypes!: FsAbilityType[];

  weaponTypes!: FsWeaponType[];

  weapons!: FsWeapon[];

  facilityTypes!: FsFacilityType[];

  facilities!: FsFacility[];

  character: NewCharacterFormResult = {
    canceled: false,
    characterType: {
      id: 'SHIROMUSUME',
      name: '城娘',
      code: '10',
      count: 1,
      geographTypes: [],
      hasSubTypes: true,
      isCostCalcEnable: true,
      isKaichikuEnable: true,
      weaponTypes: [],
    },
    //subCharacterType: { id: 'BOUKENSHA', code: '18', count: 1, name: '冒険者' },
    characterName: 'ダノター城',
    rarerity: 7,
    weaponType: { baseCost: 3, code: '10', count: 2, id: 'YUMI', name: '弓' },
    geographTypes: [
      { id: 'HIRA', name: '平', order: 1 },
      { id: 'MIZU', name: '水', order: 3 },
    ],
    region: { id: 'KAIGAI', name: '海外', order: 9 },
    cost: 5,
    costKai: 4,
    voiceActors: [],
    illustrators: [],
    abilities: [
      { id: '', descriptions: ['a', 'b', 'c'], name: 'AAA', type: 'TOKUGI' },
      {
        id: '',
        descriptions: ['hogehoge', 'piyopiyo'],
        name: 'BBB',
        type: 'KEIRYAKU',
        keiryakuInterval: 30,
        keiryakuCost: 10,
        tokenLayouts: ['赤', '青'],
      },
    ],
    abilityTypes: [
      { id: '', name: '特技', order: 0 },
      { id: '', name: '計略', order: 4 },
    ],
    abilitiesKai: [],
    abilityTypesKai: [],
    characterTags: [
      { id: '', name: '日本100名城', characters: [] },
      { id: '', name: '夏', characters: [] },
    ],
    motifWeapons: [
      { id: '', type: '', name: '一乗飛燕小太刀', attack: 4, descriptions: ['a', 'b'], effects: ['k'], rarerity: 5 },
    ],
    motifFacilities: [],
  };

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {}

  ngOnInit(): void {
    //    this.abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];
    this.weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];
    this.weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeapon[];
    this.facilityTypes = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];
    this.facilities = this.firestore.getData(FsCollectionName.Facilities) as FsFacility[];
  }

  printResult(result: NewFacilityFormResult) {
    this.logger.debug(result);
  }
}
