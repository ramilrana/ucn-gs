import type { ProgramFaculty, Slot } from '../types/content';

/**
 * Faculty of Programs (About), entered exactly as UCN supplied it on 2026-11-21, in the supplied order. Each line's
 * "Name, post-nominals - role" is split at " - " only to show the role on its own line; no wording is changed.
 * Note: these spellings differ from the photo file names used on the people page (kept as supplied in each place):
 * "Maria Cristina" (here) vs "Maria Christina"; "Analyn D. Ramos, EdD" (here) vs "PhD"; "Rosemarie T. Bigueras, DIT"
 * (here) vs "Biguueras, MIT".
 */
export const facultyOfPrograms: Slot<ProgramFaculty[]> = {
  status: 'published',
  label: 'Faculty of Programs',
  value: [
    {
      title: 'Graduate School Program Chairpersons',
      members: [
        { name: 'Girly H. Naval, DBA', role: 'Dean & DBA Chairperson' },
        { name: 'Maria Cristina C. Azuelo, PhD', role: 'DPA Chairperson' },
        { name: 'Consuelo R. Saenz, EdD', role: 'EdD Chairperson' },
        { name: 'Rosalie A. Almadrones, PhD', role: 'MPA Chairperson' },
        { name: 'Manuel C. Dime, DBA', role: 'MBA Chairperson' },
        { name: 'Analyn D. Ramos, EdD', role: 'MAEd Chairperson' },
        { name: 'Jocelyn O. Torio, DIT', role: 'MIT Chairperson' },
      ],
    },
    {
      title: 'Faculty of Doctor of Public Administration & Master in Public Administration',
      members: [
        { name: 'Aireen V. Ablao, DPA' },
        { name: 'Rosalie A. Almadrones, PhD' },
        { name: 'Maria Cristina C. Azuelo, PhD' },
        { name: 'Sarah Marie P. Aviado, DPA' },
        { name: 'Atty. Ryan L. Estevez, DPA' },
        { name: 'Noel S. Manila, MAPA' },
        { name: 'Jesse O. Opeña Jr., PhD' },
      ],
    },
    {
      title: 'Faculty of Doctor in Business Administration & Master in Business Administration',
      members: [
        { name: 'Manuel C. Dime, DBA' },
        { name: 'Emmalyn C. Guaves, DBA' },
        { name: 'Gehana D. Lamug, DBA' },
        { name: 'Girly H. Naval, DBA' },
        { name: 'Mechelle Grace B. Geromo, DBA' },
        { name: 'Jefferson T. Dacer, CPA, MBA' },
      ],
    },
    {
      title: 'Faculty of Doctor of Education & Master of Arts in Education (Major in ELM)',
      members: [
        { name: 'Eduardo M. Abad, EdD' },
        { name: 'Delma Jean V. Abad, PhD' },
        { name: 'Adrian C. Guinto, PhD' },
        { name: 'Nemia C. Puse, EdD' },
        { name: 'Analyn D. Ramos, EdD' },
        { name: 'Jennifer S. Rubio, PhD' },
        { name: 'Consuelo R. Saenz, EdD' },
        { name: 'Dolores C. Volante, EdD' },
      ],
    },
    {
      title: 'Faculty of Master of Arts in Education (Major in Teaching Filipino Language)',
      members: [
        { name: 'Edgar P. Aban, PhD' },
        { name: 'Rose Ann DP. Aler, PhD' },
        { name: 'Melchor M. Amor, PhD' },
        { name: 'Edwin R. Ichiano, PhD' },
        { name: 'Ryan S. Rodriguez, PhD' },
      ],
    },
    {
      title: 'Faculty of Master in Information Technology',
      members: [
        { name: 'Daniel E. Maligat, Jr., DIT' },
        { name: 'Jocelyn O. Torio, DIT' },
        { name: 'Rosemarie T. Bigueras, DIT' },
        { name: 'Evelyn M. Baesa, DIT' },
        { name: 'Mary Grace B. Bolos, DIT' },
        { name: 'Alexy Gene B. Castillo, DIT' },
        { name: 'Edgar Bryan B. Nicart, DIT' },
        { name: 'Edralin R. Raro, DIT' },
      ],
    },
  ],
};
