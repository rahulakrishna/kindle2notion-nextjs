export type Clipping = {
  title: string;
  author: string;
  body: string;
};

type Thumbnail = {
  smallThumbnail: string;
  thumbnail: string;
};

export type CleanedClipping = {
  title: string;
  author: string;
  clippings: Array<string>;
  coverImage: Thumbnail | undefined;
};

export type ClippingsResult = {
  loading: boolean;
  error: boolean | string;
  data: Array<CleanedClipping>;
};
