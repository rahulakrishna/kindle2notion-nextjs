export type Clipping = {
  title: string;
  author: string;
  body: string;
};

export type CleanedClipping = {
  title: string;
  author: string;
  clippings: Array<string>;
  coverImage: string | { smallThumbnail: string; thumbnail: string };
};

export type ClippingsResult = {
  loading: boolean;
  error: boolean | string;
  data: Array<CleanedClipping>;
};
