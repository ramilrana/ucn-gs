export type Status = 'published' | 'pending';
export type ResourceFormat = 'pdf' | 'image' | 'video' | 'folder' | 'doc' | 'link';
export type ResourceSource =
  | { kind: 'local'; path: `/files/${string}` }
  | { kind: 'drive'; fileId: string }
  | { kind: 'drive-folder'; folderId: string }
  | { kind: 'youtube'; videoId: string }
  | { kind: 'external'; url: string };
interface ResourceBase {
  id: string; title: string; description?: string; format: ResourceFormat; downloadable?: boolean;
  /** Show a local PDF in an inline frame (Task 6 validates it). */
  inline?: boolean;
}
export type Resource = ResourceBase &
  ({ status: 'published'; source: ResourceSource } | { status: 'pending'; source?: ResourceSource });
export interface ImageAsset { src: string; srcSet?: string; width: number; height: number; alt: string; caption?: string }
export type Slot<T> = { label: string } & ({ status: 'published'; value: T } | { status: 'pending'; value?: T });
export type EvidenceBlock =
  | { type: 'text'; paragraphs: string[]; lang?: string }
  | { type: 'document'; resource: Resource; embed?: boolean }
  | { type: 'resources'; items: Resource[] }
  | { type: 'gallery'; images: ImageAsset[] }
  | { type: 'video'; resource: Resource };
export interface EvidenceGroup { id: string; title: string; status: Status; blocks: EvidenceBlock[] }
export interface Area {
  slug: string; order: number; title: string; status: Status; summary?: string[];
  gallery: Slot<ImageAsset[]>; narrativeReport: Resource; groups: EvidenceGroup[];
  additionalFiles: Resource[]; avp?: Resource & { avpTitle?: string };
}
export interface Recommendation {
  areaSlug: string; number: number; title: string; status: Status; statement?: string[];
  document: Resource; evidence: EvidenceGroup[]; additionalFiles: Resource[];
}
export type PersonRole = 'official' | 'faculty' | 'admin-support' | 'staff' | 'student-assistant';
export interface Person {
  id: string; name: string; postNominals?: string; position: string; rank?: string;
  department?: string; role: PersonRole; photo?: ImageAsset; status: Status;
}
/** One list on the Faculty of Programs page: a heading and its people, in the supplied order. */
export interface ProgramFaculty { title: string; members: { name: string; role?: string }[] }
export interface Faq { id: string; question: string; answer: string[]; status: Status }
export interface ResourceGroup { id: string; title: string; status: Status; items: Resource[] }
export interface LeaderMessage { name: string; position: string; photo?: ImageAsset; paragraphs: string[] }
/** Text for one academic program: its heading and either list items (objectives) or paragraphs (descriptions). */
export interface ProgramText { program: string; text: string[] }
export interface SiteContent {
  universityName: string; schoolName: string; programName: Slot<string>;
  areasLabel: string; contentUpdated: string; // ISO date
  contact: Slot<{ address: string; email?: string; phone?: string; hours?: string }>;
  mapQuery: Slot<string>;
  /** Campus coordinates shown as text above the map, as supplied. */
  coordinates?: Slot<string>;
}
export interface HomeContent {
  leadershipSlides: Slot<ImageAsset[]>;
  accreditationHeading: string; accreditationSlides: Slot<ImageAsset[]>;
  presidentMessage: Slot<LeaderMessage>; deanMessage: Slot<LeaderMessage>; programChairMessage: Slot<LeaderMessage>;
}
export interface AboutContent {
  photo: Slot<ImageAsset>; intro: Slot<string[]>; mission: Slot<string[]>; vision: Slot<string[]>; qualityPolicy: Slot<string[]>;
  goals: Slot<string[]>; objectives: Slot<ProgramText[]>; programDescriptions: Slot<ProgramText[]>;
  history: Slot<string[]>; deans: Slot<string[]>;
}
export interface CertificateContent { pdf: Resource; image: Slot<ImageAsset> }
