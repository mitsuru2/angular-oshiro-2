interface TypeDataBase {
  id: number;
  name: string;
  order: number;
}

export interface AbilityType extends TypeDataBase {}
export interface FacilityType extends TypeDataBase {}
export interface GeographType extends TypeDataBase {}
export interface Region extends TypeDataBase {}
