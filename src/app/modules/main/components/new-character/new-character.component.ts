import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCharacterType } from 'src/app/services/firestore-data/firestore-document.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FirestoreCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent implements OnInit {
  characterTypes!: FsCharacterType[];

  characterTypes2!: { id: string; index: number; name: string; order: string }[];

  value: any;

  characterTypeNames!: string[];

  selectedName: string = '';

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace('new NewCharacterComponent()');
  }

  ngOnInit(): void {
    this.characterTypes = this.firestore.getData(FirestoreCollectionName.CharacterTypes) as FsCharacterType[];
    this.characterTypes2 = [];
    for (let c of this.characterTypes) {
      let tmp = { id: c.id, index: c.index, name: c.names[0], order: c.order };
      if (c.names.length > 1) {
        tmp.name += ' | ' + c.names[1];
      }
      this.characterTypes2.push(tmp);
    }
    this.logger.debug(`this.characterTypes.length: ${this.characterTypes.length}`);
    this.logger.debug(`this.characterTypes2.length: ${this.characterTypes2.length}`);
    this.characterTypes2.sort((a, b) => {
      return a.order < b.order ? -1 : 1;
    });
  }
}
