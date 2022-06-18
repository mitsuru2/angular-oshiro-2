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
  descriptions: string[];
  keiryakuInterval?: number;
  keiryakuCost?: number;
  tokenLayouts?: string[];
}

export interface FsAbilityType extends FsDocumentBaseWithOrder {
  name: string;
}

export interface FsCharacterTag extends FsDocumentBase {
  name: string;
  characters: string[];
}

export interface FsCharacterType extends FsDocumentBaseWithCode {
  name: string;
  weaponTypes: string[];
  geographTypes: string[];
  regions?: string[];
  isCostCalcEnable: boolean;
  isKaichikuEnable: boolean;
  hasSubTypes: boolean;
  subTypes?: FsSubCharacterType[];
}

export interface FsSubCharacterType extends FsDocumentBaseWithCode {
  name: string;
}

export const FsCharacterRarerityMax = 7;

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

export const FsFacilityRarerityMax = 5;

export interface FsFacility extends FsDocumentBase {
  type: string;
  name: string;
  rarerity: number;
  descriptions?: string[];
  effects?: string[];
  details?: string[];
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

export const FsWeaponRarerityMax = 5;

export interface FsWeapon extends FsDocumentBase {
  type: string;
  name: string;
  rarerity: number;
  descriptions: string[];
  attack: number;
  attack_kai?: number;
  effects: string[];
  effects_kai?: string[];
}
