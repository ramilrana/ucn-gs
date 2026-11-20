import chairPhoto from '../assets/home/messages/chair.png?h=240;480&format=webp&as=picture';
import deanPhoto from '../assets/home/messages/dean.png?h=240;480&format=webp&as=picture';
// The President's file is only 247x339, so it is used at its own size (no enlargement).
import presidentPhoto from '../assets/home/messages/president.png?format=webp&as=picture';
import { toImageAsset } from '../lib/images';
import type { HomeContent } from '../types/content';
import { leadershipSlides } from './leadership';

export const home: HomeContent = {
  leadershipSlides: {
    status: 'published',
    label: 'Leadership photographs (President, Dean, faculty)',
    value: leadershipSlides,
  },
  accreditationSlide1: { status: 'pending', label: 'First accreditation slide' },
  // Renamed 2026-11-20 at the user's request (was "LEVEL IV AACCUP ACCREDITATION").
  accreditationHeading: 'MPA LEVEL 4 PHASE 2 AACCUP ACCREDITATION',
  accreditationSlide2: { status: 'pending', label: 'Second accreditation slide' },
  gallery: { status: 'pending', label: 'Second slideshow or photo gallery' },
  video: { id: 'home-video', title: 'Graduate School video', format: 'video', status: 'pending' },
  // Wording from UCN (2026-11-19). Photos from UCN (2026-11-20), shown in full as supplied (user's request: no
  // cropping); only the Dean's white background was removed, and large files scaled down to 960px high.
  presidentMessage: {
    status: 'published',
    label: "President's photograph and message",
    value: {
      name: 'ATTY. RYAN L. ESTEVEZ, DPA',
      position: 'President, University of Camarines Norte',
      photo: toImageAsset(presidentPhoto, 'Portrait of Atty. Ryan L. Estevez, DPA'),
      paragraphs: [
        'Warm greetings to our students, faculty, alumni, stakeholders, and esteemed accreditors from the Accrediting Agency of Chartered Colleges and Universities in the Philippines (AACCUP)!',
        'Welcome to the official webpage of the Graduate School – Master in Public Administration (MPA) program of the University of Camarines Norte (UCN).',
        'As UCN embarks on a new chapter as a full-fledged state university, our commitment to cultivating ethical, innovative, and service-driven public leaders remains stronger than ever. The Master in Public Administration program stands at the forefront of this mission—bridging academic rigor, impactful research, and responsive community extension to address the evolving governance needs of Camarines Norte and the Bicol Region.',
        'This website reflects our dedication to transparency, accessibility, and continuous quality assurance as we undergo our AACCUP Level IV, Phase 2 accreditation survey visit from November 25 to 27, 2026.',
        'Submitting our programs to the highest standards of external evaluation is vital to our institutional vision: Innovate. Lead. Transform.',
        'I extend my deepest gratitude to the Graduate School administration, faculty, staff, students, and partner communities whose collective efforts sustain the excellence of our MPA program.',
        'Together, let us continue advancing transformative governance and inclusive development for the communities we serve.',
        'Mabuhay ang University of Camarines Norte!',
      ],
    },
  },
  deanMessage: {
    status: 'published',
    label: "Dean's photograph and message",
    value: {
      name: 'GIRLY H. NAVAL, DBA',
      position: 'Dean, Graduate School',
      photo: toImageAsset(deanPhoto, 'Portrait of Girly H. Naval, DBA'),
      paragraphs: [
        'Our country continues to thirst for leaders whose commitment to public service goes beyond position and authority—leaders driven by integrity, competence, compassion, and a genuine sense of vocation.',
        'As we move closer to the aspirations of Ambisyon Natin 2040, an important question remains: How far have we come, and what more can we contribute to the future we envision? The government cannot pursue this vision alone. The academe has a vital role in preparing and nurturing the next generation of public servants who will translate good governance into meaningful results for our people.',
        "As the newly appointed Dean of the Graduate School of the University of Camarines Norte, I take pride in our institution's continuing contribution to this responsibility, particularly through the Master in Public Administration program. We encourage our graduate students, especially the young and aspiring public servants, to see education not merely as a means of professional advancement, but as preparation for a life of meaningful service.",
        'As we journey toward a better Philippines, let us be reminded that nation-building is a shared responsibility. Let us learn with purpose, lead with integrity, and serve with compassion. Together, let us help shape the leaders our country needs and make our own meaningful mark in history.',
        'The future of public service begins with the leaders we choose to become today.',
      ],
    },
  },
  programChairMessage: {
    status: 'published',
    label: "Program Chair's photograph and message",
    value: {
      name: 'ROSALIE A. ALMADRONES, PhD',
      position: 'Program Chairperson, Master in Public Administration Program',
      photo: toImageAsset(chairPhoto, 'Portrait of Rosalie A. Almadrones, PhD'),
      paragraphs: [
        'On behalf of the faculty members, students, and staff of the Master in Public Administration (MPA) Program, I warmly welcome you to our Graduate School. It is my privilege to share with you the continuing journey, accomplishments, and aspirations of our academic community as we pursue excellence in public administration education, research, and public service.',
        'The Master in Public Administration Program is committed to developing competent, ethical, and transformative public administrators who are equipped with the knowledge, skills, and values necessary to address the evolving challenges of governance and public service. Through quality instruction, relevant research, and meaningful community engagement, we strive to provide our students with opportunities to deepen their understanding of public policies, institutional management, leadership, and the dynamics of public governance.',
        'As Program Chairperson, I am honored to lead and work alongside individuals who share a common vision of academic excellence and public service. Moving forward, we remain committed to sustaining our accomplishments, embracing opportunities for innovation, strengthening partnerships, and continuously enhancing the quality and relevance of our program.',
        'Together, let us continue to cultivate principled leadership, advance good governance, and inspire positive transformation through public service.',
      ],
    },
  },
};
