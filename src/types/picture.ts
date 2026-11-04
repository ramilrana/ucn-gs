/** Shape of vite-imagetools `?as=picture` output. The plugin does not export a type for it. */
export interface Picture {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
}
