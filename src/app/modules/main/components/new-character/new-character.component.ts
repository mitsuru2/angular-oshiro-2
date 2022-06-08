import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCharacter, FsCharacterType } from 'src/app/services/firestore-data/firestore-document.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FirestoreCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FormControl, FormGroup } from '@angular/forms';
import {
  CharacterTypeInNewCharacterForm,
  NewCharacterForm,
  RarerityInNewCharacterForm,
} from './new-character-form.interface';

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent implements OnInit {
  formData!: NewCharacterForm;

  characterTypes!: FsCharacterType[];

  characterTypeItems!: CharacterTypeInNewCharacterForm[];

  selectedCharacterType?: CharacterTypeInNewCharacterForm;

  rarerityItems!: RarerityInNewCharacterForm[];

  selectedRarerity?: RarerityInNewCharacterForm;

  inputName: string = '';

  shiromusumeFiles?: any[];

  character: FsCharacter = <FsCharacter>{};

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace('new NewCharacterComponent()');
  }

  ngOnInit(): void {
    this.characterTypes = this.firestore.getData(FirestoreCollectionName.CharacterTypes) as FsCharacterType[];
    this.characterTypeItems = this.makeCharacterTypeItems(this.characterTypes);
    this.rarerityItems = this.makeRarerityItems();
  }

  private makeCharacterTypeItems(fsData: FsCharacterType[]): CharacterTypeInNewCharacterForm[] {
    this.logger.trace('NewCharacterComponent.makeCharacterTypeItems()');

    let list = [];

    for (let c of fsData) {
      let tmp: CharacterTypeInNewCharacterForm = {
        id: c.id,
        index: c.index,
        names: { ...c.names },
        count: c.count,
        longName: c.names[0],
        code: c.code,
      };
      if (c.names.length > 1) {
        tmp.longName += ' | ' + c.names[1];
      }
      list.push(tmp);
    }
    list.sort((a, b) => {
      return a.code < b.code ? -1 : 1;
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
    if (this.selectedCharacterType) {
      this.character.type = this.selectedCharacterType.index;
      this.character.name = this.inputName;
      this.character.id = '';

      //this.firestore.getNewIndex(FirestoreCollectionName.CharacterTypes, 0);
      //this.firestore.addData(FirestoreCollectionName.Characters, this.character);
    }
  }

  onFileChange(id: string, event: Event) {
    this.logger.trace('NewCharacterComponent.onFileChange()');

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    if (this.shiromusumeFiles == null) {
      this.shiromusumeFiles = [];
    }
    this.shiromusumeFiles.push(input.files[0]);
  }

  clearInputName() {
    this.inputName = '';
  }
}
