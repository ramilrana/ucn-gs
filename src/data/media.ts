import type { ImageItem, MediaItem, VideoItem } from "../types/media";

/**
 * Single source of truth for all media.
 * Replace the placeholder files in public/media/ with your own, then update the entries below.
 */
export const mediaItems: readonly MediaItem[] = [
  {
    id: "img-001",
    type: "image",
    title: "Field data collection",
    description:
      "Research teams gather environmental samples for a multi-year community study.",
    category: "research",
    src: "/media/images/field-work.svg",
    alt: "Researchers collecting samples outdoors",
    width: 1600,
    height: 900,
    featured: true,
  },
  {
    id: "img-002",
    type: "image",
    title: "Laboratory analysis",
    description:
      "Graduate researchers analyse results from the latest experimental series.",
    category: "research",
    src: "/media/images/laboratory-analysis.svg",
    alt: "Researcher analysing data in a laboratory",
    width: 1600,
    height: 900,
    featured: true,
  },
  {
    id: "img-003",
    type: "image",
    title: "Annual Research Symposium",
    description:
      "Faculty and students present their findings to the wider university community.",
    category: "events",
    src: "/media/images/symposium.svg",
    alt: "Presenter speaking at a research symposium",
    width: 1600,
    height: 900,
    featured: true,
  },
  {
    id: "img-004",
    type: "image",
    title: "Research awards ceremony",
    description:
      "Recognising outstanding research achievements across all colleges.",
    category: "events",
    src: "/media/images/awards-ceremony.svg",
    alt: "Award recipients on stage at a ceremony",
    width: 1600,
    height: 900,
    featured: true,
  },
  {
    id: "img-005",
    type: "image",
    title: "Faculty researchers",
    description: "Principal investigators from across the university.",
    category: "people",
    src: "/media/images/faculty-team.svg",
    alt: "Group of faculty researchers standing together",
    width: 1600,
    height: 900,
  },
  {
    id: "img-006",
    type: "image",
    title: "Student mentoring programme",
    description:
      "Early-career researchers are paired with experienced mentors.",
    category: "people",
    src: "/media/images/student-mentoring.svg",
    alt: "Student and mentor reviewing a research poster",
    width: 1600,
    height: 900,
  },
  {
    id: "img-007",
    type: "image",
    title: "Research laboratory",
    description:
      "Shared laboratory space available to university research teams.",
    category: "facilities",
    src: "/media/images/research-lab.svg",
    alt: "Interior of a modern research laboratory",
    width: 1600,
    height: 900,
  },
  {
    id: "img-008",
    type: "image",
    title: "Innovation hub",
    description:
      "A collaborative workspace for projects with industry and community partners.",
    category: "facilities",
    src: "/media/images/innovation-hub.svg",
    alt: "Open collaborative workspace with desks and screens",
    width: 1600,
    height: 900,
  },
  {
    id: "vid-001",
    type: "video",
    title: "Research Symposium recap",
    description: "Highlights from this year’s symposium.",
    category: "events",
    src: "/media/videos/sample.mp4",
    poster: "/media/posters/symposium-recap.svg",
  },
  {
    id: "vid-002",
    type: "video",
    title: "Laboratory tour",
    description: "A short walk through our shared research facilities.",
    category: "facilities",
    src: "/media/videos/sample.mp4",
    poster: "/media/posters/lab-tour.svg",
  },
];

export const imageItems: readonly ImageItem[] = mediaItems.filter(
  (item): item is ImageItem => item.type === "image",
);

export const featuredImages: readonly ImageItem[] = imageItems.filter(
  (item) => item.featured,
);

export const videoItems: readonly VideoItem[] = mediaItems.filter(
  (item): item is VideoItem => item.type === "video",
);

export const portraitItems: readonly ImageItem[] = [
  {
    id: "portrait-001",
    type: "image",
    title: "Dr. Maria Santos",
    category: "people",
    src: "/media/images/portraits/santos.webp",
    alt: "Portrait of Dr. Maria Santos",
    width: 400,
    height: 400,
  },
  {
    id: "portrait-002",
    type: "image",
    title: "Dr. Juan Dela Cruz",
    category: "people",
    src: "/media/images/portraits/delacruz.webp",
    alt: "Portrait of Dr. Juan Dela Cruz",
    width: 400,
    height: 400,
  },
];

export const campusMap: ImageItem = {
  id: "campus-map",
  type: "image",
  title: "Campus map",
  category: "facilities",
  src: "/public/SchoolLogo.png",
  alt: "Campus map with the Research Office building highlighted",
  width: 1200,
  height: 800,
};
