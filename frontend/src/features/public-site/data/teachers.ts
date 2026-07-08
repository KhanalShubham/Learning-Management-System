export interface Teacher {
  slug: string;
  name: string;
  role: string;
  department: string;
  subjects: string[];
  experienceYears: number;
  bio: string;
  photoUrl?: string;
}

export const teachers: Teacher[] = [
  {
    slug: 'hari-prasad-oli',
    name: 'Hari Prasad Oli',
    role: 'Department Head',
    department: 'Mathematics & Science',
    subjects: ['Mathematics', 'Optional Mathematics'],
    experienceYears: 16,
    bio: 'Hari has taught mathematics at Deukhuri since the school\'s early years, and leads the department\'s monthly mock-exam program for Grade 9 and 10.',
  },
  {
    slug: 'sabita-kandel',
    name: 'Sabita Kandel',
    role: 'Senior Teacher',
    department: 'Mathematics & Science',
    subjects: ['Science', 'Computer Science'],
    experienceYears: 9,
    bio: 'Sabita runs the science lab sessions for Lower and Higher Secondary, and coordinates the annual inter-school science exhibition team.',
  },
  {
    slug: 'laxmi-kumari-thapa',
    name: 'Laxmi Kumari Thapa',
    role: 'Department Head',
    department: 'English & Languages',
    subjects: ['English', 'Nepali'],
    experienceYears: 14,
    bio: 'Laxmi has led the languages department for eight years and started the school\'s weekly reading-hour program for Primary sections.',
  },
  {
    slug: 'ramesh-basnet',
    name: 'Ramesh Basnet',
    role: 'Teacher',
    department: 'English & Languages',
    subjects: ['English', 'Health & Physical Education'],
    experienceYears: 6,
    bio: 'Ramesh teaches English across Grade 6 to 8 and also coaches the school\'s inter-house debate teams.',
  },
  {
    slug: 'gopal-dev-sharma',
    name: 'Gopal Dev Sharma',
    role: 'Department Head',
    department: 'Social Studies',
    subjects: ['Social Studies'],
    experienceYears: 11,
    bio: 'Gopal has designed the current-affairs component of the Grade 9-10 social studies curriculum, drawing on his background in local journalism.',
  },
  {
    slug: 'anita-poudel',
    name: 'Anita Poudel',
    role: 'Teacher',
    department: 'Social Studies',
    subjects: ['Social Studies', 'Population Studies'],
    experienceYears: 5,
    bio: 'Anita joined Deukhuri after five years teaching in Butwal, and now coordinates the school\'s community-service outreach days.',
  },
  {
    slug: 'binod-chaudhary',
    name: 'Binod Chaudhary',
    role: 'Department Head',
    department: 'Arts, Music & Sports',
    subjects: ['Physical Education', 'Sports Coaching'],
    experienceYears: 13,
    bio: 'Binod has organised Annual Sports Week for over a decade, and coaches the football and athletics teams year-round.',
  },
  {
    slug: 'sunita-rai',
    name: 'Sunita Rai',
    role: 'Teacher',
    department: 'Arts, Music & Sports',
    subjects: ['Art', 'Music'],
    experienceYears: 7,
    bio: 'Sunita runs the after-school art and music club, and directs the student performances at the annual day celebration.',
  },
];
