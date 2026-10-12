export interface NavItem {
  path: string;
  label: string;
}

export interface ResearchArea {
  title: string;
  description: string;
}

export interface SiteConfig {
  location: {
    building: string;
    landmarks: readonly string[];
    directionsNote: string;
  };
  officeName: string;
  universityName: string;
  monogram: string;
  tagline: string;
  heroTitle: string;
  heroText: string;
  about: readonly string[];
  researchAreas: readonly ResearchArea[];
  navItems: readonly NavItem[];
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  universityUrl: string;
}

/** Placeholder content. Replace every value with the Research Office's real information. */
export const site: SiteConfig = {
  location: {
    building: "Research Building, 2nd Floor",
    landmarks: [
      "Beside the University Library",
      "Across from the Main Gate",
    ] as readonly string[],
    directionsNote: "Visitors should sign in at the ground-floor lobby.",
  },
  officeName: "Research Office",
  universityName: "University of Camarines Norte",
  monogram: "R",
  tagline: "Supporting research that serves our university and community.",
  heroTitle: "Research that serves our university and community",
  heroText:
    "Explore the projects, people and facilities supported by the Research Office, from field studies to laboratory discoveries.",
  about: [
    "The Research Office supports faculty, students and partners at every stage of the research journey, from developing proposals to sharing results.",
    "We manage funding opportunities, research ethics, partnerships and training, and we celebrate the achievements of our research community through events, publications and media.",
    "This gallery brings together photographs and videos from our projects, events, people and facilities.",
  ],
  researchAreas: [
    {
      title: "Health and life sciences",
      description:
        "Studies that improve wellbeing, from clinical research to public health.",
    },
    {
      title: "Environment and sustainability",
      description: "Work on climate, ecosystems and resilient communities.",
    },
    {
      title: "Technology and engineering",
      description:
        "Applied research in computing, materials and infrastructure.",
    },
    {
      title: "Society and education",
      description:
        "Research on learning, culture, policy and community development.",
    },
  ],
  navItems: [
    { path: "/", label: "Home" },
    { path: "/gallery", label: "Gallery" },
    { path: "/videos", label: "Videos" },
    { path: "/about", label: "About" },
  ],
  contact: {
    email: "research@example.edu",
    phone: "+00 000 000 0000",
    address: "Administration Building, Room 000, University Campus",
    hours: "Monday to Friday, 8:00 to 17:00",
  },
  universityUrl: "https://www.example.edu",
};
