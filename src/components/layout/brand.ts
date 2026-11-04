import logo from '../../assets/brand/ucn-logo.png?w=64;128&format=webp&as=picture';
import { site } from '../../content';
import { toImageAsset } from '../../lib/images';

/** The university seal, the only institutional mark, shared by the header and the footer. */
export const seal = toImageAsset(logo, `${site.universityName} seal`);

/** Width that keeps the seal's aspect ratio at the given display height. */
export function sealWidthFor(height: number): number {
  return Math.round((height * seal.width) / seal.height);
}
