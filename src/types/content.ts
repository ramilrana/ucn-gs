export type Status = 'published' | 'pending';
export type ResourceFormat = 'pdf' | 'image' | 'video' | 'folder' | 'doc' | 'link';
export type ResourceSource =
  | { kind: 'local'; path: `/files/${string}` }
  | { kind: 'drive'; fileId: string }
  | { kind: 'drive-folder'; folderId: string }
  | { kind: 'youtube'; videoId: string }
  | { kind: 'external'; url: string };
interface ResourceBase { id: string; title: string; description?: string; format: ResourceFormat; downloadable?: boolean }
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
  number: number; title: string; status: Status; statement?: string[];
  document: Resource; evidence: EvidenceGroup[]; additionalFiles: Resource[];
}
export type PersonRole = 'official' | 'faculty' | 'staff' | 'student-assistant';
export interface Person {
  id: string; name: string; postNominals?: string; position: string; rank?: string;
  department?: string; role: PersonRole; photo?: ImageAsset; status: Status;
}
export interface Faq { id: string; question: string; answer: string[]; status: Status }
export interface ResourceGroup { id: string; title: string; status: Status; items: Resource[] }
export interface LeaderMessage { name: string; position: string; photo?: ImageAsset; paragraphs: string[] }
export interface SiteContent {
  universityName: string; schoolName: string; programName: Slot<string>;
  areasLabel: string; contentUpdated: string; // ISO date
  contact: Slot<{ address: string; email?: string; phone?: string; hours?: string }>;
  mapQuery: Slot<string>;
}
