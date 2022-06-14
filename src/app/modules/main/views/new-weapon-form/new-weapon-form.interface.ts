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
  attack_kai?: number;
  descriptions?: string[];
  effects?: string[];
  effects_kai?: string[];
}
