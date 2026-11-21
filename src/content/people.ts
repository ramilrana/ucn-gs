import p01 from '../assets/people/01-ryan-l-estevez.png?w=256;512&format=webp&as=picture';
import p02 from '../assets/people/02-girly-h-naval.png?w=256;512&format=webp&as=picture';
import p03 from '../assets/people/03-maria-christina-c-azuelo.png?w=256;512&format=webp&as=picture';
import p04 from '../assets/people/04-consuelo-r-saenz.png?w=256;512&format=webp&as=picture';
import p05 from '../assets/people/05-rosalie-a-almadrones.png?w=256;512&format=webp&as=picture';
import p06 from '../assets/people/06-manuel-c-dime.png?w=256;512&format=webp&as=picture';
import p07 from '../assets/people/07-analyn-d-ramos.png?w=256;512&format=webp&as=picture';
import p08 from '../assets/people/08-jocelyn-o-torio.png?w=256;512&format=webp&as=picture';
import p09 from '../assets/people/09-adrian-c-guinto.png?w=256;512&format=webp&as=picture';
import p10 from '../assets/people/10-aireen-v-ablao.png?w=256;512&format=webp&as=picture';
import p11 from '../assets/people/11-delma-jean-v-abad.png?w=256;512&format=webp&as=picture';
import p12 from '../assets/people/12-dolores-c-volante.png?w=256;512&format=webp&as=picture';
import p13 from '../assets/people/13-edgar-p-aban.png?w=256;512&format=webp&as=picture';
import p14 from '../assets/people/14-eduardo-m-abad.png?w=256;512&format=webp&as=picture';
import p15 from '../assets/people/15-edwin-r-ichiano.png?w=256;512&format=webp&as=picture';
import p16 from '../assets/people/16-emmalyn-c-guaves.png?w=256;512&format=webp&as=picture';
import p17 from '../assets/people/17-gehana-d-lamug.png?w=256;512&format=webp&as=picture';
import p18 from '../assets/people/18-jefferson-t-dacer.png?w=256;512&format=webp&as=picture';
import p19 from '../assets/people/19-jennifer-s-rubio.png?w=256;512&format=webp&as=picture';
import p20 from '../assets/people/20-jesse-o-opena-jr.png?w=256;512&format=webp&as=picture';
import p21 from '../assets/people/21-mary-grace-b-bolos.png?w=256;512&format=webp&as=picture';
import p22 from '../assets/people/22-mechelle-grace-b-geromo.png?w=256;512&format=webp&as=picture';
import p23 from '../assets/people/23-melchor-m-amor.png?w=256;512&format=webp&as=picture';
import p24 from '../assets/people/24-nemia-c-puse.png?w=256;512&format=webp&as=picture';
import p25 from '../assets/people/25-noel-s-manila.png?w=256;512&format=webp&as=picture';
import p26 from '../assets/people/26-rose-ann-dp-aler.png?w=256;512&format=webp&as=picture';
import p27 from '../assets/people/27-rosemarie-t-biguueras.png?w=256;512&format=webp&as=picture';
import p28 from '../assets/people/28-ryan-s-rodriguez.png?w=256;512&format=webp&as=picture';
import p29 from '../assets/people/29-sarah-marie-p-aviado.png?w=256;512&format=webp&as=picture';
import p30 from '../assets/people/30-sheila-p-sapusao.png?w=256;512&format=webp&as=picture';
import p31 from '../assets/people/31-lea-l-fulgueras.png?w=256;512&format=webp&as=picture';
import p32 from '../assets/people/32-maricel-a-balon.png?w=256;512&format=webp&as=picture';
import p33 from '../assets/people/33-pamela-m-supilanas.png?w=256;512&format=webp&as=picture';
import p34 from '../assets/people/34-emerald-isle-r-dela-paz.png?w=256;512&format=webp&as=picture';
import p35 from '../assets/people/35-patrick-banega.png?w=256;512&format=webp&as=picture';
import p36 from '../assets/people/36-tashnhia-v-blas.png?w=256;512&format=webp&as=picture';
import { toImageAsset } from '../lib/images';
import type { Person } from '../types/content';

/**
 * Faculty, staff and student assistants, from UCN's photo set (2026-11-21), in the user's order: 1 President and
 * 2 Dean (featured), 3-8 as numbered, then the rest in the folder's order, staff and student assistants last.
 * Names, post-nominals and positions come from the file names. Changes, all display-only: names supplied in capitals
 * are written in title case; "ALMADRONES , PhD" lost its stray space; two positions that ran together are split onto
 * two lines (\n). Maria Christina C. Azuelo's file has no position; "DPA Chairperson" is taken from her leadership
 * slide (src/content/leadership.ts). The photos are round with an orange ring on a transparent square.
 */
export const people: Person[] = [
  {
    id: 'ryan-l-estevez',
    name: 'Atty. Ryan L. Estevez',
    postNominals: 'DPA',
    position: 'SUC President III',
    role: 'official',
    photo: toImageAsset(p01, 'Portrait of Atty. Ryan L. Estevez'),
    status: 'published',
  },
  {
    id: 'girly-h-naval',
    name: 'Girly H. Naval',
    postNominals: 'DBA',
    position: 'Dean & DBA Chairperson',
    role: 'official',
    photo: toImageAsset(p02, 'Portrait of Girly H. Naval'),
    status: 'published',
  },
  {
    id: 'maria-christina-c-azuelo',
    name: 'Maria Christina C. Azuelo',
    postNominals: 'PhD',
    position: 'DPA Chairperson',
    role: 'faculty',
    photo: toImageAsset(p03, 'Portrait of Maria Christina C. Azuelo'),
    status: 'published',
  },
  {
    id: 'consuelo-r-saenz',
    name: 'Consuelo R. Saenz',
    postNominals: 'EdD',
    position: 'EdD Chairperson',
    role: 'faculty',
    photo: toImageAsset(p04, 'Portrait of Consuelo R. Saenz'),
    status: 'published',
  },
  {
    id: 'rosalie-a-almadrones',
    name: 'Rosalie A. Almadrones',
    postNominals: 'PhD',
    position: 'MPA Chairperson',
    role: 'faculty',
    photo: toImageAsset(p05, 'Portrait of Rosalie A. Almadrones'),
    status: 'published',
  },
  {
    id: 'manuel-c-dime',
    name: 'Manuel C. Dime',
    postNominals: 'DBA',
    position: 'MBA Chairperson',
    role: 'faculty',
    photo: toImageAsset(p06, 'Portrait of Manuel C. Dime'),
    status: 'published',
  },
  {
    id: 'analyn-d-ramos',
    name: 'Analyn D. Ramos',
    postNominals: 'PhD',
    position: 'MAEd Chairperson',
    role: 'faculty',
    photo: toImageAsset(p07, 'Portrait of Analyn D. Ramos'),
    status: 'published',
  },
  {
    id: 'jocelyn-o-torio',
    name: 'Jocelyn O. Torio',
    postNominals: 'DIT',
    position: 'MIT Chairperson',
    role: 'faculty',
    photo: toImageAsset(p08, 'Portrait of Jocelyn O. Torio'),
    status: 'published',
  },
  {
    id: 'adrian-c-guinto',
    name: 'Adrian C. Guinto',
    postNominals: 'PhD',
    position: 'Associate Professor II',
    role: 'faculty',
    photo: toImageAsset(p09, 'Portrait of Adrian C. Guinto'),
    status: 'published',
  },
  {
    id: 'aireen-v-ablao',
    name: 'Aireen V. Ablao',
    postNominals: 'DPA',
    position: 'Board Secretary I',
    role: 'faculty',
    photo: toImageAsset(p10, 'Portrait of Aireen V. Ablao'),
    status: 'published',
  },
  {
    id: 'delma-jean-v-abad',
    name: 'Delma Jean V. Abad',
    postNominals: 'PhD',
    position: 'Associate Professor V',
    role: 'faculty',
    photo: toImageAsset(p11, 'Portrait of Delma Jean V. Abad'),
    status: 'published',
  },
  {
    id: 'dolores-c-volante',
    name: 'Dolores C. Volante',
    postNominals: 'EdD',
    position: 'VP for Academic Affairs',
    role: 'faculty',
    photo: toImageAsset(p12, 'Portrait of Dolores C. Volante'),
    status: 'published',
  },
  {
    id: 'edgar-p-aban',
    name: 'Edgar P. Aban',
    postNominals: 'PhD',
    position: 'Associate Professor I',
    role: 'faculty',
    photo: toImageAsset(p13, 'Portrait of Edgar P. Aban'),
    status: 'published',
  },
  {
    id: 'eduardo-m-abad',
    name: 'Eduardo M. Abad',
    postNominals: 'EdD',
    position: 'Dean, CoEd',
    role: 'faculty',
    photo: toImageAsset(p14, 'Portrait of Eduardo M. Abad'),
    status: 'published',
  },
  {
    id: 'edwin-r-ichiano',
    name: 'Edwin R. Ichiano',
    postNominals: 'PhD',
    position: 'Associate Professor II',
    role: 'faculty',
    photo: toImageAsset(p15, 'Portrait of Edwin R. Ichiano'),
    status: 'published',
  },
  {
    id: 'emmalyn-c-guaves',
    name: 'Emmalyn C. Guaves',
    postNominals: 'DBA',
    position: 'Director, Planning Development',
    role: 'faculty',
    photo: toImageAsset(p16, 'Portrait of Emmalyn C. Guaves'),
    status: 'published',
  },
  {
    id: 'gehana-d-lamug',
    name: 'Gehana D. Lamug',
    postNominals: 'DBA',
    position: 'Associate Professor III\nDean, CBPA',
    role: 'faculty',
    photo: toImageAsset(p17, 'Portrait of Gehana D. Lamug'),
    status: 'published',
  },
  {
    id: 'jefferson-t-dacer',
    name: 'Jefferson T. Dacer',
    postNominals: 'CPA, MBA',
    position: 'Chief Administrative Officer',
    role: 'faculty',
    photo: toImageAsset(p18, 'Portrait of Jefferson T. Dacer'),
    status: 'published',
  },
  {
    id: 'jennifer-s-rubio',
    name: 'Jennifer S. Rubio',
    postNominals: 'PhD',
    position: 'Associate Professor V',
    role: 'faculty',
    photo: toImageAsset(p19, 'Portrait of Jennifer S. Rubio'),
    status: 'published',
  },
  {
    id: 'jesse-o-opena-jr',
    name: 'Jesse O. Opeña Jr.',
    postNominals: 'PhD',
    position: 'Associate Professor II',
    role: 'faculty',
    photo: toImageAsset(p20, 'Portrait of Jesse O. Opeña Jr.'),
    status: 'published',
  },
  {
    id: 'mary-grace-b-bolos',
    name: 'Mary Grace B. Bolos',
    postNominals: 'DIT',
    position: 'Assistant Professor III',
    role: 'faculty',
    photo: toImageAsset(p21, 'Portrait of Mary Grace B. Bolos'),
    status: 'published',
  },
  {
    id: 'mechelle-grace-b-geromo',
    name: 'Mechelle Grace B. Geromo',
    postNominals: 'DBA',
    position: 'Associate Professor I',
    role: 'faculty',
    photo: toImageAsset(p22, 'Portrait of Mechelle Grace B. Geromo'),
    status: 'published',
  },
  {
    id: 'melchor-m-amor',
    name: 'Melchor M. Amor',
    postNominals: 'PhD',
    position: 'Instructor III',
    role: 'faculty',
    photo: toImageAsset(p23, 'Portrait of Melchor M. Amor'),
    status: 'published',
  },
  {
    id: 'nemia-c-puse',
    name: 'Nemia C. Puse',
    postNominals: 'EdD',
    position: 'Assistant Professor IV',
    role: 'faculty',
    photo: toImageAsset(p24, 'Portrait of Nemia C. Puse'),
    status: 'published',
  },
  {
    id: 'noel-s-manila',
    name: 'Noel S. Manila',
    postNominals: 'MAPA',
    position: 'Assistant Professor II',
    role: 'faculty',
    photo: toImageAsset(p25, 'Portrait of Noel S. Manila'),
    status: 'published',
  },
  {
    id: 'rose-ann-dp-aler',
    name: 'Rose Ann DP. Aler',
    postNominals: 'PhD',
    position: 'Assistant Professor IV',
    role: 'faculty',
    photo: toImageAsset(p26, 'Portrait of Rose Ann DP. Aler'),
    status: 'published',
  },
  {
    id: 'rosemarie-t-biguueras',
    name: 'Rosemarie T. Biguueras',
    postNominals: 'MIT',
    position: 'Associate Professor IV',
    role: 'faculty',
    photo: toImageAsset(p27, 'Portrait of Rosemarie T. Biguueras'),
    status: 'published',
  },
  {
    id: 'ryan-s-rodriguez',
    name: 'Ryan S. Rodriguez',
    postNominals: 'PhD',
    position: 'Assistant Professor II',
    role: 'faculty',
    photo: toImageAsset(p28, 'Portrait of Ryan S. Rodriguez'),
    status: 'published',
  },
  {
    id: 'sarah-marie-p-aviado',
    name: 'Sarah Marie P. Aviado',
    postNominals: 'DPA',
    position: 'Provincial Public Information Officer',
    role: 'faculty',
    photo: toImageAsset(p29, 'Portrait of Sarah Marie P. Aviado'),
    status: 'published',
  },
  {
    id: 'sheila-p-sapusao',
    name: 'Sheila P. Sapusao',
    postNominals: 'MPA',
    position: 'Registrar III',
    role: 'staff',
    photo: toImageAsset(p30, 'Portrait of Sheila P. Sapusao'),
    status: 'published',
  },
  {
    id: 'lea-l-fulgueras',
    name: 'Lea L. Fulgueras',
    postNominals: 'MLS',
    position: 'Librarian III',
    role: 'staff',
    photo: toImageAsset(p31, 'Portrait of Lea L. Fulgueras'),
    status: 'published',
  },
  {
    id: 'maricel-a-balon',
    name: 'Maricel A. Balon',
    postNominals: 'MPA',
    position: 'Registrar In-Charge\nCollege Secretary',
    role: 'staff',
    photo: toImageAsset(p32, 'Portrait of Maricel A. Balon'),
    status: 'published',
  },
  {
    id: 'pamela-m-supilanas',
    name: 'Pamela M. Supilanas',
    position: 'Office Assistant',
    role: 'staff',
    photo: toImageAsset(p33, 'Portrait of Pamela M. Supilanas'),
    status: 'published',
  },
  {
    id: 'emerald-isle-r-dela-paz',
    name: 'Emerald Isle R. DeLa Paz',
    position: 'GS Student Assistant',
    role: 'student-assistant',
    photo: toImageAsset(p34, 'Portrait of Emerald Isle R. DeLa Paz'),
    status: 'published',
  },
  {
    id: 'patrick-banega',
    name: 'Patrick Bañega',
    position: 'GS Student Assistant',
    role: 'student-assistant',
    photo: toImageAsset(p35, 'Portrait of Patrick Bañega'),
    status: 'published',
  },
  {
    id: 'tashnhia-v-blas',
    name: 'Tashnhia V. Blas',
    position: 'GS Student Assistant',
    role: 'student-assistant',
    photo: toImageAsset(p36, 'Portrait of Tashnhia V. Blas'),
    status: 'published',
  },
];
