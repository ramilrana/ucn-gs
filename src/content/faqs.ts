import type { Faq } from '../types/content';

/** Entered exactly as UCN supplied them on 2026-11-21, in the supplied order (the source's list numbers are dropped). */
export const faqs: Faq[] = [
  {
    id: 'faq-class-schedule',
    question: 'I am a working professional. How manageable is the class schedule?',
    answer: [
      'The Graduate School recognizes the demands of balancing work, family, and advanced studies. To help students manage their commitments, the prescribed academic load for part-time students is up to nine (9) units during a regular term and not more than six (6) units during the Midterm term. This allows you to pursue your graduate education at a manageable pace while attending to your professional responsibilities.',
    ],
    status: 'published',
  },
  {
    id: 'faq-learning-modality',
    question: 'What is the teaching and learning modality of the Graduate School?',
    answer: [
      'The Graduate School adopts a flexible hybrid learning approach, combining online and face-to-face learning activities. This provides students with greater flexibility in managing their learning alongside their professional and personal commitments. While students can organize their learning activities around their schedules, they are still expected to meet course requirements, attend scheduled sessions, and observe submission deadlines.',
    ],
    status: 'published',
  },
  {
    id: 'faq-leave-of-absence',
    question: 'What if I need to take a break from my graduate studies and temporarily stop enrolling?',
    answer: [
      'We understand that personal and professional circumstances may sometimes require you to pause your studies. A student who intends not to enroll for two (2) consecutive terms must submit a written request for Leave of Absence (LOA) to the Office of the Dean, Graduate School. This formal process helps ensure that your academic status is properly documented and that your return to studies can be appropriately facilitated.',
    ],
    status: 'published',
  },
];
