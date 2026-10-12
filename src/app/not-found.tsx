import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/section-heading';

export default function NotFound() {
  return (
    <Section>
      <Container className="max-w-xl text-center">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          This page has <em className="font-serif font-normal text-brand-600">melted</em> away
        </h1>
        <p className="mt-5 text-lg text-ink/60">The page you’re looking for doesn’t exist or has been moved.</p>
        <ButtonLink href="/" size="lg" className="mt-9">
          Back to home
        </ButtonLink>
      </Container>
    </Section>
  );
}
