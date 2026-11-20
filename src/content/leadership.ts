// Leadership slideshow for the Home page: 18 "Faculty of the Graduate School" slides supplied by UCN (2026-11-20),
// in the order given (President, Dean, program chairpersons, then faculty). Alt text repeats each slide's own
// wording, in title case; spellings are kept exactly as printed on the slides.
import s01 from '../assets/home/leadership/slide-01.png?w=528;1056&format=webp&as=picture';
import s02 from '../assets/home/leadership/slide-02.png?w=528;1056&format=webp&as=picture';
import s03 from '../assets/home/leadership/slide-03.png?w=528;1056&format=webp&as=picture';
import s04 from '../assets/home/leadership/slide-04.png?w=528;1056&format=webp&as=picture';
import s05 from '../assets/home/leadership/slide-05.png?w=528;1056&format=webp&as=picture';
import s06 from '../assets/home/leadership/slide-06.png?w=528;1056&format=webp&as=picture';
import s07 from '../assets/home/leadership/slide-07.png?w=528;1056&format=webp&as=picture';
import s08 from '../assets/home/leadership/slide-08.png?w=528;1056&format=webp&as=picture';
import s09 from '../assets/home/leadership/slide-09.png?w=528;1056&format=webp&as=picture';
import s10 from '../assets/home/leadership/slide-10.png?w=528;1056&format=webp&as=picture';
import s11 from '../assets/home/leadership/slide-11.png?w=528;1056&format=webp&as=picture';
import s12 from '../assets/home/leadership/slide-12.png?w=528;1056&format=webp&as=picture';
import s13 from '../assets/home/leadership/slide-13.png?w=528;1056&format=webp&as=picture';
import s14 from '../assets/home/leadership/slide-14.png?w=528;1056&format=webp&as=picture';
import s15 from '../assets/home/leadership/slide-15.png?w=528;1056&format=webp&as=picture';
import s16 from '../assets/home/leadership/slide-16.png?w=528;1056&format=webp&as=picture';
import s17 from '../assets/home/leadership/slide-17.png?w=528;1056&format=webp&as=picture';
import s18 from '../assets/home/leadership/slide-18.png?w=528;1056&format=webp&as=picture';
import { toImageAsset } from '../lib/images';
import type { ImageAsset } from '../types/content';

const slide = (who: string) => `Faculty of the Graduate School: ${who}`;

export const leadershipSlides: ImageAsset[] = [
  toImageAsset(s01, slide('Atty. Ryan L. Estevez, DPA, SUC President III')),
  toImageAsset(s02, slide('Girly H. Naval, DBA, Dean & DBA Chairperson')),
  toImageAsset(s03, slide('Maria Christina C. Azuelo, PhD, DPA Chairperson')),
  toImageAsset(s04, slide('Consuelo R. Saenz, EdD, EdD Chairperson')),
  toImageAsset(s05, slide('Rosalie A. Almadrones, PhD, MPA Chairperson')),
  toImageAsset(s06, slide('Manuel C. Dime, DBA, MBA Chairperson')),
  toImageAsset(s07, slide('Analyn D. Ramos, PhD, MAEd Chairperson')),
  toImageAsset(s08, slide('Jocelyn O. Torio, DIT, MIT Chairperson')),
  toImageAsset(s09, slide('Rosemarie T. Bigueras, MIT, and Sarah Marie P. Aviado, DPA')),
  toImageAsset(s10, slide('Aireen V. Ablao, DPA, and Noel S. Manila, MAPA')),
  toImageAsset(s11, slide('Jesse O. Opeña, Jr., PhD, and Emmalyn C. Guaves, DBA')),
  toImageAsset(s12, slide('Gehana B. Lamug, DBA, and Mechelle Grace B. Geromo, DBA')),
  toImageAsset(s13, slide('Jefferson T. Dacer, CPA, MBA, and Eduardo M. Abad, EdD')),
  toImageAsset(s14, slide('Delma Jean V. Abad, PhD, and Adrian C. Guinto, PhD')),
  toImageAsset(s15, slide('Nemia C. Puse, EdD, and Jennifer S. Rubio, PhD')),
  toImageAsset(s16, slide('Edgar P. Aban, PhD, and Doleres C. Volante, EdD')),
  toImageAsset(s17, slide('Rose Ann D. Aler, PhD, and Melchor M. Amor, PhD')),
  toImageAsset(s18, slide('Edwin R. Echano, PhD, and Ryan S. Rodriguez, PhD')),
];
