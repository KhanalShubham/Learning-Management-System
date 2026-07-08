export interface Notice {
  slug: string;
  date: string;
  tag: 'Admissions' | 'Examination' | 'Event' | 'Notice';
  title: string;
  excerpt: string;
  body: string[];
}

export const notices: Notice[] = [
  {
    slug: 'admissions-open-2082',
    date: 'Asar 12, 2082',
    tag: 'Admissions',
    title: 'Admissions open for the 2082 academic session',
    excerpt: 'Seats are limited for Nursery through Grade 6. Forms are available at the school office and online.',
    body: [
      'Deukhuri Public School is now accepting admission forms for the 2082 academic session, for Nursery through Grade 6. Seats in each section are limited, and forms are processed in the order they are received.',
      'Parents can collect a form at the school office between 10 AM and 4 PM on any working day, or download one from the admissions page on this website. A short conversation with the class teacher is scheduled for Nursery through Grade 2; Grade 3 and above additionally requires the previous school\'s report card.',
      'The admission fee and monthly fee for each level are listed on the fee structure page. Families with more than one child enrolling receive a sibling concession — ask at the office when submitting the form.',
    ],
  },
  {
    slug: 'first-terminal-routine',
    date: 'Asar 4, 2082',
    tag: 'Examination',
    title: 'First terminal examination routine published',
    excerpt: 'Grade 1 to 10 students can collect the printed routine from their class teacher this week.',
    body: [
      'The routine for the first terminal examination has been finalised for Grade 1 through Grade 10. Class teachers will distribute printed copies this week; the routine is also available at the office notice board.',
      'Examinations begin two weeks from today and run for ten working days. Students are expected to bring their admit card, issued by the class teacher, on the first day of examinations.',
      'Parents can track subject-wise results on the parent portal as soon as each answer sheet is evaluated and entered — there is no need to wait for the final mark sheet to see how a specific subject went.',
    ],
  },
  {
    slug: 'sports-week-2082',
    date: 'Jestha 28, 2082',
    tag: 'Event',
    title: 'Annual Sports Week concludes with inter-house finals',
    excerpt: 'Congratulations to Everest House for retaining the championship shield for a second year.',
    body: [
      'This year\'s Annual Sports Week closed with the inter-house athletics finals on the school ground, watched by students, teachers, and parents across all four houses.',
      'Everest House retained the championship shield for a second consecutive year, finishing ahead of Annapurna House by twelve points. Individual medals were awarded across track and field events for Grade 4 through Grade 10.',
      'Thank you to every parent who came to cheer, and to the sports committee for organising the week. Photographs from the event will be added to the campus gallery shortly.',
    ],
  },
];
