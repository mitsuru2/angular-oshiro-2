import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FirestoreCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsAbilityType,
  FsFacility,
  FsFacilityType,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
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

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {}

  ngOnInit(): void {
    //    this.abilityTypes = this.firestore.getData(FirestoreCollectionName.AbilityTypes) as FsAbilityType[];
    this.weaponTypes = this.firestore.getData(FirestoreCollectionName.WeaponTypes) as FsWeaponType[];
    this.weapons = this.firestore.getData(FirestoreCollectionName.Weapons) as FsWeapon[];
    this.facilityTypes = this.firestore.getData(FirestoreCollectionName.FacilityTypes) as FsFacilityType[];
    this.facilities = this.firestore.getData(FirestoreCollectionName.Facilities) as FsFacility[];
  }

  printResult(result: NewFacilityFormResult) {
    this.logger.debug(result);
  }
}
