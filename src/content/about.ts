import campusBuilding from '../assets/about/campus-building.jpg?w=640;1280;2000&format=webp&as=picture';
import { toImageAsset } from '../lib/images';
import type { AboutContent } from '../types/content';

// Wording from UCN, entered exactly as supplied: the introduction and the photo added 2026-11-21 (the photo's alt text is
// ours); Vision, Mission and Quality Policy updated 2026-11-20 (the
// supplied Mission has no closing full stop); the rest 2026-11-19.
export const about: AboutContent = {
  photo: {
    status: 'published',
    label: 'About photograph',
    value: toImageAsset(
      campusBuilding,
      'The two-storey CNSC main campus building, with the college seal and the letters CNSC on its front wall',
    ),
  },
  intro: {
    status: 'published',
    label: 'About introduction',
    value: [
      'The Graduate School offers an extensive selection of advanced degree programs aimed at professionals seeking to enhance their leadership abilities and subject-matter expertise across diverse sectors. With specialized programs in Business Administration, Public Administration, and Education, the Graduate School is dedicated to cultivating high-level executives, skilled public administrators, and visionary educational leaders. These programs provide a rigorous blend of in-depth theoretical knowledge, cutting-edge research, and practical applications, encouraging students to develop strong critical thinking, analytical reasoning, and leadership skills. The curriculum is designed to sharpen strategic decision-making capabilities, promote ethical and socially responsible leadership, and equip graduates to tackle complex and evolving challenges in both national and international contexts. By leveraging a combination of traditional classroom instruction, research initiatives, technology-enhanced learning, and real-world case studies, the Graduate School ensures its students are well-prepared to lead and innovate in government agencies, private enterprises, non-profit organizations, and educational institutions. The program’s commitment to addressing contemporary trends and societal needs guarantees that graduates are not only equipped with the knowledge and tools for success but are also empowered to drive meaningful change within their respective industries.',
    ],
  },
  mission: {
    status: 'published',
    label: 'Mission',
    value: [
      'We commit to providing accessible, innovative, and values-driven education that nurtures community-responsive and globally competent changemakers through culture, leadership, impact-driven instruction, research, extension, production, and partnerships for sustainable community development',
    ],
  },
  vision: {
    status: 'published',
    label: 'Vision',
    value: ['A Transformative Borderless University Empowering Sustainable Communities'],
  },
  qualityPolicy: {
    status: 'published',
    label: 'Quality Policy',
    value: [
      'The University of Camarines Norte commits to excellence in instruction, research, extension, and production services from classroom to communities. We lead through an institutionalized quality culture; we innovate through continuous improvement and responsive technology; and we transform stakeholders into changemakers with industry-aligned skills and values-driven character.',
    ],
  },
  goals: {
    status: 'published',
    label: 'Goals',
    value: [
      'The Graduate School aims to develop quality and values-laden graduates with high degree of professionalism and leadership in their chosen area of discipline through specialization, research and extension services.',
    ],
  },
  objectives: {
    status: 'published',
    label: 'Program Objectives',
    value: [
      {
        program: 'Doctor in Business Administration Program Objectives',
        text: [
          'Develop expertise and advanced skills in teaching, research, managerial, entrepreneurial, and strategic knowledge and skills necessary for leading and managing all facets of contemporary organizations;',
          'Enhance the management skills, critical analysis, and innovative problem-solving skills of students needed to function effectively within an organization;',
          'Create and defend their solutions to the problems of crisis management, profitable growth opportunities, and change leadership.',
          'In-depth understanding of a chosen field of specialization;',
          'A strong foundation of business management and research for high-level decision-making in business; and',
          'Theoretical and empirical competencies and skills in handling management and administrative problems.',
        ],
      },
      {
        program: 'Doctor of Public Administration Program Objectives',
        text: [
          'Develop high-quality public administration leadership and expertise in government organizations to meet the international standards;',
          'Provide advanced knowledge, skills and competencies in instruction, research, production and extension services through the use of technologies towards national growth and development;',
          'Demonstrate understanding of current issues and trends in government administrative settings and provide knowledge on addressing challenges created by those changes; and',
          'Instill the values of participation, accountability, responsiveness, transparency and integrity in government and governance.',
        ],
      },
      {
        program: 'Doctor of Education Program Objectives',
        text: [
          'To develop high quality leadership and expertise in the field of educational leadership and management to meet the global standards;',
          'To enhance conceptual, analytical and research skills in the field of educational management through the use of technologies;',
          'Provide advanced knowledge, skills and competencies in instruction, research, production and extension services;',
          'To strengthen research capabilities towards national growth and development;',
          'To cultivate a culture of scholarship, mentoring, professionalism, ethical and social responsibility and humanism.',
        ],
      },
      {
        program: 'Master in Public Administration Program Objectives',
        text: [
          'To develop effective and efficient leaders and administrators of the government organizations;',
          'To enhance students’ capability in decision-making;',
          'To facilitate conduct of research that promote economic, scientific, political and social progress; and',
          'To improve students’ professional skills in public administration and governance.',
        ],
      },
      {
        program: 'Master in Business Administration Program Objectives',
        text: [
          'To develop effective and efficient leaders and administrators of private organizations;',
          'To facilitate conduct of research and development that promote economic, scientific, business and development; and',
          'To enhance students’ professional and managerial skills in business administration.',
        ],
      },
      {
        program: 'Master of Arts in Education Program Objectives',
        text: [
          'To develop and produce potential school managers and leaders who have in-depth knowledge, skills and attitudes that will contribute for the continuous improvement of school management system;',
          'To produce graduates who are capable in conducting relevant research that will address and improve the teaching and learning process;',
          'To produce graduates who have deeper pedagogical content knowledge in teaching their area of specialization particularly in Filipino subject; and',
          'To produce graduates who are capable in designing and evaluating curriculum and instruction.',
        ],
      },
      {
        program: 'Master in Information Technology',
        text: [
          'Demonstrate information technology concepts, designs, and solutions effectively and professionally',
          'Apply knowledge and best practices of information technology to produce effective designs and real-world solutions for specific problems;',
          'Utilize current technologies, tools, software systems, and modern computing platforms;',
          'Identify, analyze, and synthesize professional literature relating to the field of information technology and related fields',
        ],
      },
    ],
  },
  programDescriptions: {
    status: 'published',
    label: 'Program Description',
    value: [
      {
        program: 'Doctor in Business Administration Program Description',
        text: [
          'The Doctor in Business Administration is a program designed to meet the needs of top executives, entrepreneurs, and business faculty to contribute to their fields and respond to the needs of society particularly in the management of various government and private agencies. The program combines an in-depth examination of theories and practices in management, specifically research methods and basic discipline which contribute to the understanding of the managerial process. The program seeks to broaden students’ understanding of managerial processes and the relationship of management in national and international issues. Likewise, it is designed to combine practitioners’ experiences in academic abstraction in a distinctive curriculum content with the mission of the college.',
        ],
      },
      {
        program: 'Doctor of Public Administration Program Description',
        text: [
          'The Doctor of Public Administration is designed to develop effective leaders and managers of government agencies and public-focused non-profit organizations. In this program, the students will be trained to effectively, efficiently, and equitably translate public policies into public programs, and projects and be equipped with the knowledge in both academic and professional settings focusing on the theory, analysis, and problem-solving skills to solve practical problems in government and governance.',
        ],
      },
      {
        program: 'Doctor of Education Program Description',
        text: [
          'This executive program in educational leadership and management is designed for experienced educational leaders and managers. Through the adoption of an innovative teaching-learning system that combines traditional classroom work with technology-enabled learning strategies, independent study and one-to-one faculty, student consultation, the program enables the participants to complement their extant knowledge, competencies and skills in the various areas of educational leadership and management.',
        ],
      },
      {
        program: 'Master in Public Administration Program Description',
        text: [
          'A research-oriented post baccalaureate designed for professionals employed in the public service, to enhance their critical and analytical skills in effectively and efficiently managing government operations.',
        ],
      },
      {
        program: 'Master in Business Administration Program Description',
        text: [
          'The Master in Business Administration (MBA) program is designed to develop competent and socially responsible managers and leaders in today’s global business environment. The program focuses on those skills needed by business professionals such as analytical reasoning, communication, leadership, strategic thinking professional competence, critical and creative thinking skills, technical competitive skills, productivity, social and ethical responsibility, interpersonal skills and lifelong learning. The curriculum emphasizes the knowledge of fundamental and advanced business practices, applications currently in demand in international and multinational corporations while integrating global trends and practices and information systems application. The program is designed for professionals who already have relevant experience gained in the workplace, but wish to develop their business administration and leadership skills. It is designed for working professionals who wish to pursue further career advancement in their respective fields. In addition, the MBA course exposes future senior leaders and managers to all aspects of business at a graduate level and prepares them for senior management responsibilities.',
        ],
      },
      {
        program: 'Master of Arts in Education',
        text: [
          'This program aims to cultivate essential skills and strategies for teaching, tailored to meet the evolving educational needs of diverse student learners within a knowledge-based community. Additionally, it enhances teachers’ proficiency in school leadership, management, and administration, guided by educational theories, principles, and practices, in consideration of the emerging changes and developments from local, national and international perspectives.',
        ],
      },
      {
        program: 'Master in Information Technology',
        text: [
          'MIT provides students the chance to enrich their knowledge and apply IT Theories and Principles that address real-world challenges.',
        ],
      },
    ],
  },
  history: {
    status: 'published',
    label: 'History',
    value: [
      'From its establishment as Camarines Norte State College (CNSC) to its transition into the University of Camarines Norte (UCN), the institution continues its commitment to providing accessible, quality higher education. Camarines Norte State College, a public, non-sectarian, and non-profit institution of higher learning, was established on April 2, 1992, through Republic Act No. 7352. The college aims to provide top-tier professional instruction and technological training in agriculture, education, arts and sciences, information technology, advanced studies, and short-term technical and vocational courses. It also promotes research, extension, production services, and progressive leadership across all disciplines. Through its continued growth and development, the institution remains dedicated to providing the people of Camarines Norte with access to affordable, quality tertiary education.',
      'The education sector has driven the demand for diverse post-graduate programs. In response, Premier College conceptualized the Graduate School to meet the needs of personnel from government and non-governmental organizations seeking relevant post-graduate studies. The Graduate School was officially recognized by Board Resolution No. 131 on December 20, 1996.',
      'On June 13, 1998, Camarines Norte State College received authorization from the Commission on Higher Education (CHED) to offer a Master in Public Administration, effective from the academic year 1998-1999, as per Board of Trustees Resolution No. 271-98. Since then, the Graduate School has operated as a separate unit of the College.',
      'The opening of the Graduate School was a significant highlight of the academic year 1998-1999. Employees from both public and private institutions eagerly enrolled in the program, marking the humble beginnings of a highly sought-after degree. The curriculum was designed to develop executives in public administration. The Camarines Norte State College Graduate School celebrated its first batch of graduates in March 2001.',
      'The academic year 2003-2004 marked a significant milestone with the introduction of the Master in Management program, offering specializations in Educational Planning and Management, and Human Resource Management. In April 2007, the Graduate School celebrated its first graduates from these programs.',
      'The Graduate School is led by a Dean appointed by the College President. Since its inception in 1998, the Graduate School has been under the leadership of several Deans:',
    ],
  },
  deans: {
    status: 'published',
    label: 'Deans of the Graduate School',
    value: [
      'Professor Emmanuel A. Cortez (January 4, 1999 - April 15, 1999)',
      'Dr. Godofredo E. Peteza, Jr. (OIC) (April 16, 1999 - December 2000)',
      'Dr. Erlinda J. Porcincula (January 2001 - December 31, 2005)',
      'Dr. Godofredo E. Peteza, Jr. (January 1, 2006 - December 22, 2008)',
      'Dr. Erlinda J. Porcincula (June 23, 2008 - 2013)',
      'Dr. Rusty Abanto (May 20, 2013 - February 19, 2017)',
      'Dr. Maria Cristina C. Azuelo (February 20, 2017 - August 30, 2021)',
      'Dr. Jennifer S. Rubio (August 31, 2021 - August 3, 2022)',
      'Dr. Dolores C. Volante (VPAA) (August 3, 2022 - August 30, 2022)',
      'Dr. Eduardo M. Abad (August 31, 2022 - November 2, 2026)',
      'Girly H. Naval, DBA (November 3, 2026 - present)',
    ],
  },
};
