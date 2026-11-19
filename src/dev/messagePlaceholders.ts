// Dev-only stand-in photos for the leader messages, shown until UCN sends the real portraits.
// They are scenery from picsum.photos (Unsplash licence), never a person, so no stranger appears under a
// leader's name. The files in src/dev/placeholders/ are served by the devPlaceholderPhotos plugin in
// vite.config.ts (dev server and preview-content builds only). They are not imported, so a production build
// never emits them; src/content/index.ts also drops this module there, and the card shows a silhouette.
// `npm run check:dist` fails if a dev-placeholder file reaches a production build.
import type { ImageAsset } from '../types/content';

export interface MessagePlaceholders {
  president: ImageAsset;
  dean: ImageAsset;
  programChair: ImageAsset;
}

const stand = (file: string, alt: string): ImageAsset => ({
  src: `${import.meta.env.BASE_URL}dev-placeholders/${file}`,
  width: 800,
  height: 1000,
  alt,
});

export const devMessagePlaceholders: MessagePlaceholders = {
  president: /* @__PURE__ */ stand('dev-placeholder-president.jpg', "Placeholder scenery photo until the President's photo arrives"),
  dean: /* @__PURE__ */ stand('dev-placeholder-dean.jpg', "Placeholder scenery photo until the Dean's photo arrives"),
  programChair: /* @__PURE__ */ stand('dev-placeholder-chair.jpg', "Placeholder scenery photo until the Program Chair's photo arrives"),
};
