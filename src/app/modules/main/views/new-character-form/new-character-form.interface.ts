import {
  FsAbility,
  FsCharacterType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';

export interface FsVoiceActorForNewCharacterForm extends FsVoiceActor {
  isExisting: boolean;
}

export interface FsIllustratorForNewCharacterForm extends FsIllustrator {
  isExisting: boolean;
}

export interface FsAbilityForNewCharacterForm extends FsAbility {
  tokenAvailable: boolean;
  isExisting: boolean;
}

export interface NewCharacterFormOutput {
  characterType: FsCharacterType;
  characterName: string;
  rarerity: number;
  weaponType: FsWeaponType;
  geographTypes: FsGeographType[];
  region?: FsRegion;
  cost: number;
  cost_kai?: number;
}
