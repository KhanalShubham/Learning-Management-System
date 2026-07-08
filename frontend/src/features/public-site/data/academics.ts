export interface GradeLevel {
  slug: string;
  label: string;
  range: string;
  tone: 'gold' | 'green' | 'red' | 'charcoal';
  description: string;
  subjects: string[];
  highlights: string[];
}

export const gradeLevels: GradeLevel[] = [
  {
    slug: 'early-years',
    label: 'Early Years',
    range: 'Nursery — UKG',
    tone: 'gold',
    description:
      'Play-led learning that builds the habits — sitting still, sharing, listening — a classroom depends on later.',
    subjects: ['Phonics & Early Literacy', 'Numeracy Basics', 'Rhymes & Storytelling', 'Art & Motor Skills'],
    highlights: [
      'A dedicated early-years wing with child-height furniture',
      'Two teachers per section for individual attention',
      'No written homework before Grade 1',
    ],
  },
  {
    slug: 'primary',
    label: 'Primary',
    range: 'Grade 1 — 5',
    tone: 'green',
    description: 'The years where reading, arithmetic, and curiosity about the world are meant to become second nature.',
    subjects: ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Computer Basics'],
    highlights: [
      'Weekly library period from Grade 1',
      'Continuous assessment alongside terminal exams',
      'Introductory computer lab sessions from Grade 3',
    ],
  },
  {
    slug: 'lower-secondary',
    label: 'Lower Secondary',
    range: 'Grade 6 — 8',
    tone: 'red',
    description: 'Subjects start to specialise, and students choose their first elective — arts, music, or additional science.',
    subjects: ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Health & Physical Education', 'Elective'],
    highlights: [
      'Subject teachers instead of a single class teacher',
      'Science lab sessions twice a week',
      'Inter-house debate and quiz competitions',
    ],
  },
  {
    slug: 'secondary',
    label: 'Secondary',
    range: 'Grade 9 — 10',
    tone: 'charcoal',
    description: 'SEE-focused years, with structured revision and mock examinations built into the term calendar.',
    subjects: ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Optional Mathematics', 'Computer Science'],
    highlights: [
      'Monthly mock examinations from Grade 9',
      'Career counselling sessions before SEE',
      'Small doubt-clearing groups outside class hours',
    ],
  },
];

export const portalFeatures = [
  {
    title: 'Attendance, recorded daily',
    description: 'Parents see the same register the classroom teacher marks — no waiting for a phone call.',
  },
  {
    title: 'Report cards, issued online',
    description: 'Term results, grade remarks, and rank are published to the parent portal the day they’re finalised.',
  },
  {
    title: 'Fees, paid without a queue',
    description: 'Invoices, dues, and payment history are all visible before a single rupee changes hands at the counter.',
  },
];
