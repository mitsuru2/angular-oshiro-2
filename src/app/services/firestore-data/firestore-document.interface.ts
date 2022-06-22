/**
 * Base data types.
 */
export interface FsDocumentBase {
  id: string;
  name: string;
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
  type: string;
  descriptions: string[];
  keiryakuInterval?: number;
  keiryakuCost?: number;
  tokenLayouts?: string[];
}

export interface FsAbilityType extends FsDocumentBaseWithOrder {}

export interface FsCharacterTag extends FsDocumentBase {
  characters: string[];
}

export interface FsCharacterType extends FsDocumentBaseWithCode {
  weaponTypes: string[];
  geographTypes: string[];
  regions?: string[];
  isCostCalcEnable: boolean;
  isKaichikuEnable: boolean;
  hasSubTypes: boolean;
  subTypes?: FsSubCharacterType[];
}

export interface FsSubCharacterType extends FsDocumentBaseWithCode {}

export const FsCharacterRarerityMax = 7;

export interface FsCharacter extends FsDocumentBase {
  index: string;
  type: string;
  rarerity: number;
  weaponType: string;
  geographTypes: string[];
  region?: string;
  cost: number;
  costKai?: number;
  abilities?: string[];
  abilitiesKai?: string[];
  voiceActors?: string[];
  illustrators?: string[];
  motifWeapons?: string[];
  motifFacilities?: string[];
  tags?: string[];
}

export interface FsFacilityType extends FsDocumentBaseWithCode {}

export const FsFacilityRarerityMax = 5;

export interface FsFacility extends FsDocumentBase {
  type: string;
  rarerity: number;
  descriptions?: string[];
  effects?: string[];
  details?: string[];
}

export interface FsGeographType extends FsDocumentBaseWithOrder {}

export interface FsIllustrator extends FsDocumentBase {}

export interface FsRegion extends FsDocumentBaseWithOrder {}

export interface FsVoiceActor extends FsDocumentBase {}

export interface FsWeaponType extends FsDocumentBaseWithCode {
  baseCost: number;
}

export const FsWeaponRarerityMax = 5;

export interface FsWeapon extends FsDocumentBase {
  type: string;
  rarerity: number;
  descriptions: string[];
  attack: number;
  attackKai?: number;
  effects: string[];
  effectsKai?: string[];
}
