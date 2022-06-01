import { Component, OnInit } from '@angular/core';
import { FirestoreCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { AbilityType } from 'src/app/services/firestore-data/firestore-document.interface';

@Component({
  selector: 'app-list-character',
  templateUrl: './list-character.component.html',
  styleUrls: ['./list-character.component.scss'],
})
export class ListCharacterComponent implements OnInit {
  abilityTypes!: AbilityType[];

  constructor(private firestore: FirestoreDataService) {}

  ngOnInit(): void {
    this.abilityTypes = this.firestore.getData(FirestoreCollectionName.AbilityTypes);
  }
}
