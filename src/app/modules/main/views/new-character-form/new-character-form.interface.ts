import {
  FsAbility,
  FsCharacterTag,
  FsCharacterType,
  FsFacility,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsSubCharacterType,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';

export interface FsAbilityForNewCharacterForm extends FsAbility {
  tokenAvailable: boolean;
  isExisting: boolean;
}

export interface NewCharacterFormResult {
  canceled: boolean;
  characterType: FsCharacterType;
  subCharacterType?: FsSubCharacterType;
  characterName: string;
  rarerity: number;
  weaponType: FsWeaponType;
  geographTypes: FsGeographType[];
  region?: FsRegion;
  cost: number;
  costKai?: number;
  voiceActors: FsVoiceActor[];
  illustrators: FsIllustrator[];
  motifWeapons: FsWeapon[];
  motifFacilities: FsFacility[];
  characterTags: FsCharacterTag[];
  abilities: FsAbility[];
  abilitiesKai: FsAbility[];
  // shiromusumeImage
  // ojouImage
  // tokugiImage
  // taihaImage
  // thumbnailImage
  // shiromusumeImageKai
  // tokugiImageKai
  // taihaImageKai
}
