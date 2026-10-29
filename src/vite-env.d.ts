/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_PREVIEW?: string;
}

// vite-imagetools does not export a `Picture` type, so the shape is declared here.
declare module '*as=picture' {
  interface Picture {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number };
  }
  const picture: Picture;
  export default picture;
}
