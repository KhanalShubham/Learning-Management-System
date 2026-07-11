import { BookOpen, Award, UserCheck, CreditCard, Briefcase, FileText, LayoutGrid, Book } from 'lucide-react';
import type { DocumentTemplate } from '../types';

export type DocumentCategory = 'ACADEMIC' | 'EXAMINATION' | 'IDENTITY' | 'FINANCE' | 'EMPLOYMENT';

interface CategoryMeta {
  label: string;
  description: string;
  icon: typeof BookOpen;
  accent: string; // tailwind color token used for icon chip background/text
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  ACADEMIC: {
    label: 'Academic Certificates',
    description: 'Character, graduation & academic records',
    icon: BookOpen,
    accent: 'blue',
  },
  EXAMINATION: {
    label: 'Examination Documents',
    description: 'Marksheets, admit cards & result slips',
    icon: Award,
    accent: 'amber',
  },
  IDENTITY: {
    label: 'Identity & ID Cards',
    description: 'Student and staff identification',
    icon: UserCheck,
    accent: 'violet',
  },
  FINANCE: {
    label: 'Finance & Receipts',
    description: 'Fee receipts and payment proofs',
    icon: CreditCard,
    accent: 'emerald',
  },
  EMPLOYMENT: {
    label: 'HR & Employment',
    description: 'Staff letters, appointments & experience',
    icon: Briefcase,
    accent: 'rose',
  },
};

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  label: 'Other Documents',
  description: 'Miscellaneous document layouts',
  icon: LayoutGrid,
  accent: 'slate',
};

export const getCategoryMeta = (category?: string): CategoryMeta =>
  (category && CATEGORY_META[category]) || DEFAULT_CATEGORY_META;

const CATEGORY_USE_CASES: Record<string, string[]> = {
  ACADEMIC: ['Graduation', 'Enrollment Proof'],
  EXAMINATION: ['Result Verification', 'Admit Card'],
  IDENTITY: ['Student ID', 'Access Pass'],
  FINANCE: ['Fee Receipt', 'Payment Proof'],
  EMPLOYMENT: ['Staff Records', 'HR Documentation'],
};

const humanizeType = (type: string): string =>
  type
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** Best-effort "Perfect for" tags derived from a template's type + category, for non-technical staff. */
export const getUseCases = (template: Pick<DocumentTemplate, 'type' | 'category'>): string[] => {
  const primary = humanizeType(template.type || '');
  const secondary = CATEGORY_USE_CASES[template.category] || [];
  const tags = [primary, ...secondary].filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 3);
};

export const getPaperBadges = (template: Pick<DocumentTemplate, 'pageSize' | 'orientation'>) => [
  { label: template.orientation === 'LANDSCAPE' ? 'Landscape' : 'Portrait' },
  { label: template.pageSize },
  { label: 'Printable' },
];

export { FileText, Book };
