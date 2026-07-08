// Links starting with "/public#" are anchors on the homepage and render as
// plain <a> tags (full navigation, then browser scroll-to-anchor). Links
// without a hash are real routed pages and render as router <Link>s.
export const navLinks = [
  { label: 'Home', href: '/public' },
  { label: 'About', href: '/public#about' },
  { label: 'Academics', href: '/public/academics' },
  { label: 'Faculty', href: '/public/faculty' },
  { label: 'Notices', href: '/public/notices' },
  { label: 'Admissions', href: '/public#admissions' },
  { label: 'Contact', href: '/public#contact' },
];
