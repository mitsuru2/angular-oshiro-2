/**
 * Base data types.
 */
export interface FsDocumentBase {
  id: string;
}

export interface FsDocumentBaseWithStringIndex extends FsDocumentBase {
  index: string;
}

export interface FsDocumentBaseWithOrder extends FsDocumentBase {
  order: number;
}

export interface FsDocumentBaseWithCode extends FsDocumentBase {
  code: string;
  count: number;
}

/**
 * Practical data types.
 */
export interface FsAbility extends FsDocumentBase {
  name: string;
  type: string;
  desc: string[];
}

export interface FsAbilityType extends FsDocumentBaseWithOrder {
  name: string;
}

export interface FsCharacterType extends FsDocumentBaseWithCode {
  names: string[];
  weaponTypes: string[];
  geographTypes: string[];
  regions?: string[];
  isCostCalcEnable: boolean;
  isKaichikuEnable: boolean;
}

export interface FsCharacter extends FsDocumentBaseWithStringIndex {
  type: string;
  name: string;
  rarerity: number;
  weaponType: string;
  geographTypes: string[];
  region?: string;
  cost: number;
  cost_kai?: number;
  abilities?: string[];
  abilities_kai?: string[];
  voiceActors?: string[];
  illustrators?: string[];
  motifWeapons?: string[];
  motifFacilities?: string[];
}

export interface FsFacilityType extends FsDocumentBaseWithCode {
  name: string;
}

export interface FsFacility extends FsDocumentBase {
  type: string;
  name: string;
  rarerity: number;
  desc?: string[];
}

export interface FsGeographType extends FsDocumentBaseWithOrder {
  name: string;
}

export interface FsIllustrator extends FsDocumentBase {
  name: string;
}

export interface FsRegion extends FsDocumentBaseWithOrder {
  name: string;
}

export interface FsVoiceActor extends FsDocumentBase {
  name: string;
}

export interface FsWeaponType extends FsDocumentBaseWithCode {
  name: string;
  baseCost: number;
}

export interface FsWeapon extends FsDocumentBase {
  type: string;
  name: string;
  rarerity: number;
  desc?: string[];
}
