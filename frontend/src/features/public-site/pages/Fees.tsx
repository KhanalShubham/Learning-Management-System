import { Info } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { SectionReveal } from '../components/ui/SectionReveal';
import { feeStructure, optionalServices, feeNotes } from '../data/fees';

const formatRs = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`;

export const Fees = () => {
  return (
    <div>
      <PageHero
        eyebrow="Admissions"
        title="Fee structure, by grade level"
        description="One admission fee, paid once, and a monthly fee billed through the parent portal — no hidden line items."
        crumbs={[{ label: 'Home', to: '/public' }, { label: 'Fee Structure' }]}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--brand-border)]">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[var(--brand-surface)] text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-soft)]">
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Grades</th>
                  <th className="px-6 py-4">Admission Fee</th>
                  <th className="px-6 py-4">Monthly Fee</th>
                  <th className="px-6 py-4">Exam Fee</th>
                </tr>
              </thead>
              <tbody>
                {feeStructure.map((row, i) => (
                  <tr key={row.slug} className={i % 2 === 1 ? 'bg-[var(--brand-surface)]/40' : undefined}>
                    <td className="px-6 py-4 font-semibold text-[var(--brand-charcoal)] border-t border-[var(--brand-border)]">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--brand-text-soft)] border-t border-[var(--brand-border)]">
                      {row.range}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--brand-charcoal)] border-t border-[var(--brand-border)]">
                      {formatRs(row.admissionFee)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--brand-charcoal)] border-t border-[var(--brand-border)]">
                      {formatRs(row.monthlyFee)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--brand-charcoal)] border-t border-[var(--brand-border)]">
                      {formatRs(row.examFee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-12">
            <SectionReveal>
              <h2 className="font-display text-xl font-semibold text-[var(--brand-charcoal)]">Optional services</h2>
              <div className="mt-6 divide-y divide-[var(--brand-border)] rounded-[var(--radius-card)] border border-[var(--brand-border)]">
                {optionalServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between px-6 py-4">
                    <span className="text-sm text-[var(--brand-charcoal)]">{service.name}</span>
                    <span className="text-sm font-semibold text-[var(--brand-charcoal)]">
                      {formatRs(service.price)}
                    </span>
                  </div>
                ))}
              </div>
            </SectionReveal>

            <SectionReveal delay={0.1}>
              <h2 className="font-display text-xl font-semibold text-[var(--brand-charcoal)]">Good to know</h2>
              <ul className="mt-6 space-y-4">
                {feeNotes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm text-[var(--brand-text-soft)] leading-relaxed">
                    <Info className="h-5 w-5 text-[var(--brand-red)] shrink-0 mt-0.5" />
                    {note}
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </div>

          <div className="mt-16 rounded-[var(--radius-card)] bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-[var(--brand-charcoal)]">
                Questions about a specific grade's fee?
              </h3>
              <p className="mt-1 text-sm text-[var(--brand-text-soft)]">
                The school office can walk through the exact breakdown.
              </p>
            </div>
            <Button href="/public#contact" variant="primary" className="shrink-0">
              Contact the Office
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Fees;
