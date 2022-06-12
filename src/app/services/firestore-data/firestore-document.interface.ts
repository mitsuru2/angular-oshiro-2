export interface FsDocumentBase {
  id: string;
  index: number | string;
}

export interface FsDocumentBaseWithNumberIndex extends FsDocumentBase {
  index: number;
}

export interface FsDocumentBaseWithStringIndex extends FsDocumentBase {
  index: string;
}

export interface FsDocumentBaseWithOrder extends FsDocumentBaseWithNumberIndex {
  order: number;
}

export interface FsDocumentBaseWithCode extends FsDocumentBaseWithNumberIndex {
  code: string;
  count: number;
}

export interface FsAbility extends FsDocumentBaseWithNumberIndex {
  name: string;
  type: number;
  desc: string[];
}

export interface FsAbilityType extends FsDocumentBaseWithOrder {
  name: string;
}

export interface FsCharacterType extends FsDocumentBaseWithCode {
  names: string[];
  weaponTypes: number[];
  geographTypes: number[];
  regions?: number[];
  isCostCalcEnable: boolean;
  isKaichikuEnable: boolean;
}

export interface FsCharacter extends FsDocumentBaseWithStringIndex {
  type: number;
  name: string;
  rarerity: number;
  weaponType: number;
  geographTypes: number[];
  region?: number;
  cost: number;
  cost_kai?: number;
  abilities?: number[];
  abilities_kai?: number[];
  voiceActors?: number[];
  illustrators?: number[];
  motifWeapons?: string[];
  motifFacilities?: string[];
}

export interface FsFacilityType extends FsDocumentBaseWithCode {
  name: string;
}

export interface FsGeographType extends FsDocumentBaseWithOrder {
  name: string;
}

export interface FsIllustrator extends FsDocumentBaseWithNumberIndex {
  name: string;
}

export interface FsRegion extends FsDocumentBaseWithOrder {
  name: string;
}

export interface FsVoiceActor extends FsDocumentBaseWithNumberIndex {
  name: string;
}

export interface FsWeaponType extends FsDocumentBaseWithCode {
  name: string;
  baseCost: number;
}
