import { prisma } from '@/prisma/client';
import { SchoolProfileRepository } from '@/modules/system-config/school-profile.repository';
import { BrandingRepository } from '@/modules/system-config/branding.repository';
import { LeadershipRepository } from '@/modules/system-config/leadership.repository';

export interface PublicSiteInfo {
  schoolName: string;
  motto: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  googleMapLink: string | null;
  logoUrl: string | null;
  principal: { name: string; photoUrl: string | null } | null;
  studentCount: number;
}

const schoolProfileRepository = new SchoolProfileRepository();
const brandingRepository = new BrandingRepository();
const leadershipRepository = new LeadershipRepository();

// Deliberately exposes only the subset of school-config fields safe for an
// unauthenticated visitor — never return SchoolSettings or full Leadership rows here.
export class PublicSiteService {
  public async getSiteInfo(): Promise<PublicSiteInfo> {
    const [profile, branding, principal, studentCount] = await Promise.all([
      schoolProfileRepository.getOrCreate(),
      brandingRepository.getOrCreate(),
      leadershipRepository.findByRole('PRINCIPAL'),
      prisma.student.count(),
    ]);

    return {
      schoolName: profile.name,
      motto: profile.motto,
      description: profile.description,
      phone: profile.phone,
      email: profile.email,
      address: [profile.address, profile.municipality, profile.district].filter(Boolean).join(', ') || null,
      googleMapLink: profile.googleMapLink,
      logoUrl: branding.logoUrl,
      principal: principal?.name ? { name: principal.name, photoUrl: principal.photoUrl } : null,
      studentCount,
    };
  }
}
