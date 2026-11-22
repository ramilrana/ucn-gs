// Accreditation slideshow for the Home page: 9 photographs supplied by UCN (2026-11-22, Drive zip, files 1–9), in the
// numbered order. Alt text describes each photo and repeats any printed caption.
import s01 from '../assets/home/accreditation/slide-01.jpg?w=528;975&format=webp&as=picture';
import s02 from '../assets/home/accreditation/slide-02.jpg?w=528;975&format=webp&as=picture';
import s03 from '../assets/home/accreditation/slide-03.jpg?w=528;975&format=webp&as=picture';
import s04 from '../assets/home/accreditation/slide-04.jpg?w=528;975&format=webp&as=picture';
import s05 from '../assets/home/accreditation/slide-05.jpg?w=528;975&format=webp&as=picture';
import s06 from '../assets/home/accreditation/slide-06.jpg?w=528;975&format=webp&as=picture';
import s07 from '../assets/home/accreditation/slide-07.jpg?w=528;975&format=webp&as=picture';
import s08 from '../assets/home/accreditation/slide-08.jpg?w=528;975&format=webp&as=picture';
import s09 from '../assets/home/accreditation/slide-09.jpg?w=528;975&format=webp&as=picture';
import { toImageAsset } from '../lib/images';
import type { ImageAsset } from '../types/content';

export const accreditationSlides: ImageAsset[] = [
  toImageAsset(s01, 'Group photo of Graduate School faculty, staff and participants in a function hall, over an aerial view of the campus'),
  toImageAsset(
    s02,
    'Group photo of UCN delegates at the 2nd International Congress on Pineapple 2026, September 08, 2026, Daet, Camarines Norte',
  ),
  toImageAsset(s03, 'Cultural dance performance on a lit stage'),
  toImageAsset(s04, 'Large group photo of participants in a hotel function room, many waving to the camera'),
  toImageAsset(
    s05,
    'Participants working at tables during UCN Strategic Planning 2026, July 20, 2026, Summit Hotel, Naga City, Camarines Sur',
  ),
  toImageAsset(s06, 'Large group photo of participants in a ballroom with a red carpet'),
  toImageAsset(s07, 'Group photo of participants seated and standing in a conference room, waving to the camera'),
  toImageAsset(
    s08,
    'Lakbay-Diwa Publishing announcement: Congratulations, published author, Marifel Lamadrid Fernandez, MPA, for "Communication Strategies for Disaster Preparedness and Response in the Municipality of Daet, Camarines Norte", Visionary Voices, Volume 2 Issue 6, June 2026',
  ),
  toImageAsset(s09, 'Large group photo of participants in a hotel function room, many waving to the camera, over an aerial view of the campus'),
];
