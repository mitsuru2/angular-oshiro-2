interface FsDocumentBase {
  id: string;
  index: number;
}

interface FsTypeDataBase extends FsDocumentBase {
  name: string;
  order: number;
}

export interface FsAbility extends FsDocumentBase {
  name: string;
  desc: string[];
}
export interface FsAbilityType extends FsTypeDataBase {}
export interface FsCharacterType extends FsDocumentBase {
  names: string[];
  order: string;
  num: number;
}
export interface FsCharacter extends FsDocumentBase {
  name: string;
  order: string;
  type: number;
  rarerity: number;
  FsWeaponType: number;
  FsGeographTypes: number[];
  FsRegion: number;
  cost: number;
  cost_kai?: number;
  abilities: number[];
  abilities_kai?: number[];
  FsIllustrator: number;
  FsVoiceActor: number;
  motifWeapons?: number[];
  motifFacilities?: number[];
}
export interface FsFacilityType extends FsTypeDataBase {}
export interface FsGeographType extends FsTypeDataBase {}
export interface FsIllustrator extends FsDocumentBase {
  name: string;
}
export interface FsRegion extends FsTypeDataBase {}
export interface FsVoiceActor extends FsDocumentBase {
  name: string;
}
export interface FsWeaponType extends FsTypeDataBase {
  baseCost: number;
}
