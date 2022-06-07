import { FsCharacterType } from 'src/app/services/firestore-data/firestore-document.interface';

export interface CharacterTypeInNewCharacterForm extends FsCharacterType {
  longName: string;
}

export interface RarerityInNewCharacterForm {
  name: string;
  value: number;
}

export interface NewCharacterForm {
  type: CharacterTypeInNewCharacterForm;
  rarerity: RarerityInNewCharacterForm;
  name: string;
}
