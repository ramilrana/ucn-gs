export type StaffGroup = "leadership" | "faculty" | "staff";

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  group: StaffGroup;
  department?: string;
  email?: string;
  researchInterests?: readonly string[];
  /** Matches an `id` in `portraitItems` (src/data/media.ts). */
  photoId?: string;
}
