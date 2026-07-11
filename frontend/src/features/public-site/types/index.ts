export interface PublicSiteInfo {
  schoolName: string;
  motto: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  googleMapLink: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  principal: { name: string; photoUrl: string | null } | null;
  studentCount: number;
}

export type NoticeTag = 'ADMISSIONS' | 'EXAMINATION' | 'EVENT' | 'NOTICE';

export interface PublicNotice {
  id: string;
  title: string;
  slug: string;
  tag: NoticeTag;
  excerpt: string;
  body: string[];
  attachmentUrl: string | null;
  isPinned: boolean;
  publishedAt: string;
}

export interface PublicGalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
}
