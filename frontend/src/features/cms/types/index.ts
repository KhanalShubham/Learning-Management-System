export type NoticeTag = 'ADMISSIONS' | 'EXAMINATION' | 'EVENT' | 'NOTICE';
export type RecordStatus = 'ACTIVE' | 'ARCHIVED';

export interface Notice {
  id: string;
  title: string;
  slug: string;
  tag: NoticeTag;
  excerpt: string;
  body: string[];
  attachmentUrl: string | null;
  isPinned: boolean;
  status: RecordStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticePayload {
  title: string;
  tag: NoticeTag;
  excerpt: string;
  body: string[];
  attachmentUrl?: string;
  isPinned?: boolean;
  publishedAt?: string;
}

export type UpdateNoticePayload = Partial<CreateNoticePayload>;

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AddGalleryImagePayload {
  imageUrl: string;
  caption?: string;
}

export interface UpdateGalleryImagePayload {
  caption?: string;
  displayOrder?: number;
}
