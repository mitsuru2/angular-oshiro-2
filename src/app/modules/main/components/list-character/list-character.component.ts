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
import {
  NewCharacterFormContent,
  NewCharacterFormResult,
} from '../../views/new-character-form/new-character-form.interface';
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

  character = new NewCharacterFormContent();

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
