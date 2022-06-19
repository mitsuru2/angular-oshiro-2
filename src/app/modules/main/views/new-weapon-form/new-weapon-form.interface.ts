import { FsWeaponType } from 'src/app/services/firestore-data/firestore-document.interface';

export enum NewWeaponFormMode {
  minimum,
  normal,
}

export interface NewWeaponFormResult {
  canceled: boolean;
  type: FsWeaponType;
  name: string;
  rarerity: number;
  attack?: number;
  attackKai?: number;
  descriptions?: string[];
  effects?: string[];
  effectsKai?: string[];
}
