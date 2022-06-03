import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCharacterType } from 'src/app/services/firestore-data/firestore-document.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FirestoreCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FormControl, FormGroup } from '@angular/forms';

export interface CharacterTypeInNewCharacterForm {
  index: number;
  name: string;
  order: string;
}

export interface RarerityInNewCharacterForm {
  name: string;
  value: number;
}

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent implements OnInit {
  characterTypes!: FsCharacterType[];

  characterTypeItems!: CharacterTypeInNewCharacterForm[];

  selectedCharacterType?: CharacterTypeInNewCharacterForm;

  rarerityItems!: RarerityInNewCharacterForm[];

  selectedRarerity?: RarerityInNewCharacterForm;

  newCharacterForm = new FormGroup({
    characterType: new FormControl('', []),
    rarerity: new FormControl('', []),
  });

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace('new NewCharacterComponent()');
  }

  ngOnInit(): void {
    this.characterTypes = this.firestore.getData(FirestoreCollectionName.CharacterTypes) as FsCharacterType[];
    this.characterTypeItems = this.makeCharacterTypeItems(this.characterTypes);
    this.rarerityItems = this.makeRarerityItems();
  }

  private makeCharacterTypeItems(fsData: FsCharacterType[]): CharacterTypeInNewCharacterForm[] {
    let list = [];

    for (let c of fsData) {
      let tmp: CharacterTypeInNewCharacterForm = { index: c.index, name: c.names[0], order: c.order };
      if (c.names.length > 1) {
        tmp.name += ' | ' + c.names[1];
      }
      list.push(tmp);
    }
    list.sort((a, b) => {
      return a.order < b.order ? -1 : 1;
    });

    return list;
  }

  private makeRarerityItems(): RarerityInNewCharacterForm[] {
    let list = [];

    for (let i = 0; i < 7; i++) {
      let tmp: RarerityInNewCharacterForm = { name: '★' + String(i + 1), value: i + 1 };
      list.push(tmp);
    }
    list.sort((a, b) => b.value - a.value);

    return list;
  }

  submit(): void {
    alert(JSON.stringify(this.newCharacterForm.value));
  }
}
