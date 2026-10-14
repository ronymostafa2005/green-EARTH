import Image from 'next/image';
import { ButtonLink, buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/section-heading';
import { getContactInfo } from '@/lib/site-content';
import { whatsappLink } from '@/lib/utils';

export async function CtaSection() {
  const { whatsapp } = await getContactInfo();

  return (
    <Section spacing="compactTop">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-brand-950 px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
          <Image src="/images/pages/deal.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-50" />
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950 via-brand-950/85 to-brand-950/20" />

          <div className="max-w-xl">
            <Eyebrow tone="light">Let’s work together</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.08]">
              Looking for a reliable <em className="font-serif font-normal text-sand-300">frozen food</em> supplier?
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              Tell us what you need and our export team will get back to you with a tailored offer.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/contact" variant="light" size="lg">
                Request a quote
                <Icon name="arrow" />
              </ButtonLink>
              <a
                href={whatsappLink(whatsapp)}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ variant: 'glass', size: 'lg' })}
              >
                <Icon name="whatsapp" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
