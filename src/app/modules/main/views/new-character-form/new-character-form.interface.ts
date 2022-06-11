import {
  FsCharacterType,
  FsGeographType,
  FsRegion,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';

export interface CharacterTypeInNewCharacterForm extends FsCharacterType {
  longName: string;
}

export interface RarerityInNewCharacterForm {
  name: string;
  value: number;
}

export interface NewCharacterFormOutput {
  characterType: FsCharacterType;
  characterName: string;
  rarerity: number;
  weaponType: FsWeaponType;
  geographTypes: FsGeographType[];
  region: FsRegion;
  cost: number;
  cost_kai?: number;
}
