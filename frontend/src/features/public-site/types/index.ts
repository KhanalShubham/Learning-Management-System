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
