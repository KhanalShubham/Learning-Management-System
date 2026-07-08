export interface FeeGrade {
  slug: string;
  label: string;
  range: string;
  admissionFee: number;
  monthlyFee: number;
  examFee: number;
}

export const feeStructure: FeeGrade[] = [
  { slug: 'early-years', label: 'Early Years', range: 'Nursery — UKG', admissionFee: 3000, monthlyFee: 1500, examFee: 500 },
  { slug: 'primary', label: 'Primary', range: 'Grade 1 — 5', admissionFee: 3500, monthlyFee: 1800, examFee: 700 },
  { slug: 'lower-secondary', label: 'Lower Secondary', range: 'Grade 6 — 8', admissionFee: 4000, monthlyFee: 2200, examFee: 900 },
  { slug: 'secondary', label: 'Secondary', range: 'Grade 9 — 10', admissionFee: 4500, monthlyFee: 2600, examFee: 1200 },
];

export const optionalServices = [
  { name: 'Transport (per route, monthly)', price: 1200 },
  { name: 'Hot lunch (monthly subscription)', price: 1800 },
  { name: 'Stationery & workbook set (yearly)', price: 2500 },
];

export const feeNotes = [
  'Fees are billed monthly through the parent portal — no queue at the counter.',
  'A 10% sibling concession applies to the monthly fee from the second child onward.',
  'The admission fee is one-time and due at the time of confirming a seat.',
];
