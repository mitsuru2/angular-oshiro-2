export interface XY {
  x: number;
  y: number;
}

export interface WH {
  w: number;
  h: number;
}

export interface MakeThumbnailImageResult {
  canceled: boolean;
  thumb?: Blob;
}
