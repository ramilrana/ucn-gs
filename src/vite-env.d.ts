/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_PREVIEW?: string;
}

// vite-imagetools does not export a `Picture` type, so the shape lives in src/types/picture.ts.
declare module '*as=picture' {
  const picture: import('./types/picture').Picture;
  export default picture;
}
