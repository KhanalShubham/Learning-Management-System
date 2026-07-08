import { Hero } from '../components/Hero';
import { WelcomeExperience } from '../components/WelcomeExperience';
import { StatsStrip } from '../components/StatsStrip';
import { About } from '../components/About';
import { PrincipalMessage } from '../components/PrincipalMessage';
import { Academics } from '../components/Academics';
import { Faculty } from '../components/Faculty';
import { CampusLife } from '../components/CampusLife';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';
import { Notices } from '../components/Notices';
import { Admissions } from '../components/Admissions';

export const PublicHome = () => {
  return (
    <div>
      <WelcomeExperience />
      <Hero />
      <StatsStrip />
      <About />
      <PrincipalMessage />
      <Academics />
      <Faculty />
      <CampusLife />
      <Testimonials />
      <FAQ />
      <Notices />
      <Admissions />
    </div>
  );
};

export default PublicHome;
