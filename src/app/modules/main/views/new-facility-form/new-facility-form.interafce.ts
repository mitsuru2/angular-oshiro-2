import { FsFacilityType } from 'src/app/services/firestore-data/firestore-document.interface';

export enum facilityFormMode {
  minimum,
  normal,
}

export interface NewFacilityFormResult {
  canceled: boolean;
  type: FsFacilityType;
  name: string;
  rarerity: number;
  descriptions?: string[];
  effects?: string[];
  details?: string[];
}
