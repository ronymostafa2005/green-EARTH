import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { processSteps } from '@/data/company';

export function ProcessSteps() {
  return (
    <Section spacing="tight">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-brand-950 px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
          <div aria-hidden className="absolute -top-40 -right-40 -z-10 size-[28rem] rounded-full bg-brand-500/20 blur-3xl" />

          <SectionHeading
            tone="light"
            align="start"
            eyebrow="From farm to freezer"
            title={
              <>
                Five careful steps, <em>one standard</em>
              </>
            }
            description="Every step — from sourcing to freezing — is carefully monitored to ensure consistent freshness, flavour and full traceability."
          />

          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {processSteps.map((step, i) => (
              <li key={step.title} className="border-t border-white/15 pt-6">
                <span className="font-serif text-4xl text-sand-300 italic">0{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
