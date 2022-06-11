export interface FsDocumentBase {
  id: string;
  index: number | string;
}

export interface FsAbility extends FsDocumentBase {
  index: number;
  name: string;
  type: number;
  desc: string[];
}

export interface FsAbilityType extends FsDocumentBase {
  index: number;
  name: string;
  order: number;
}

export interface FsCharacterType extends FsDocumentBase {
  index: number;
  names: string[];
  code: string;
  weaponTypes: number[];
  hasRegion: boolean;
  isCostCalcEnable: boolean;
  isKaichikuEnable: boolean;
  count: number;
}

export interface FsCharacter extends FsDocumentBase {
  index: string;
  name: string;
  type: number;
  rarerity: number;
  weaponType: number;
  geographTypes: number[];
  region?: number;
  cost: number;
  cost_kai?: number;
  abilities?: number[];
  abilities_kai?: number[];
  illustrators?: number[];
  voiceActors?: number[];
  motifWeapons?: string[];
  motifFacilities?: string[];
}

export interface FsFacilityType extends FsDocumentBase {
  index: number;
  name: string;
  code: string;
  count: number;
}

export interface FsGeographType extends FsDocumentBase {
  index: number;
  name: string;
  order: number;
}

export interface FsIllustrator extends FsDocumentBase {
  index: number;
  name: string;
}

export interface FsRegion extends FsDocumentBase {
  index: number;
  name: string;
  order: number;
}

export interface FsVoiceActor extends FsDocumentBase {
  index: number;
  name: string;
}

export interface FsWeaponType extends FsDocumentBase {
  index: number;
  name: string;
  baseCost: number;
  code: string;
  count: number;
}
