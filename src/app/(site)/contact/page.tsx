import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/contact-form';
import { Container } from '@/components/ui/container';
import { Icon, type IconName } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { PageHero } from '@/components/sections/page-hero';
import { getContactInfo, getSocialLinks, pageMetadata } from '@/lib/site-content';
import { whatsappLink } from '@/lib/utils';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('contact', {
    title: 'Contact us',
    description: 'Get in touch with the Demeter Green Earth export team for offers, samples and partnerships.',
  });
}

type ContactPageProps = {
  searchParams: Promise<{ product?: string }>;
};

type Detail = { icon: IconName; label: string; value: string; href?: string };

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [{ product }, contact, socialLinks] = await Promise.all([searchParams, getContactInfo(), getSocialLinks()]);

  const details: Detail[] = [
    { icon: 'pin', label: 'Visit us', value: contact.address },
    ...contact.phones.map((phone, i) => ({ icon: 'phone' as const, label: i === 0 ? 'Call us' : 'Or call', value: phone, href: `tel:${phone.replace(/\s+/g, '')}` })),
    ...contact.emails.map((email, i) => ({ icon: 'mail' as const, label: i === 0 ? 'Email us' : 'Or email', value: email, href: `mailto:${email}` })),
    { icon: 'whatsapp', label: 'WhatsApp', value: 'Start a chat', href: whatsappLink(contact.whatsapp) },
    ...(contact.workingHours ? [{ icon: 'globe' as const, label: 'Working hours', value: contact.workingHours }] : []),
  ];

  return (
    <>
      <PageHero
        title="Contact us"
        description="Tell us about the products and quantities you need — our export team usually replies within one business day."
      />

      <Section>
        <Container className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="flex flex-col justify-between gap-12 rounded-[2rem] bg-brand-950 p-8 text-white sm:p-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Let’s <em className="font-serif font-normal text-sand-300">talk</em>
              </h2>
              <p className="mt-3 leading-relaxed text-white/60">
                Offers, samples or long-term partnerships — we’re happy to help.
              </p>
            </div>

            <ul className="space-y-6">
              {details.map((item) => (
                <li key={`${item.label}-${item.value}`} className="flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-300">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/45 uppercase">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="mt-1 block break-words transition-colors hover:text-brand-300"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <ul className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors hover:border-brand-500 hover:bg-brand-500"
                  >
                    <Icon name={social.icon} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="rounded-[2rem] bg-cream p-8 sm:p-10">
            <h2 className="text-3xl font-semibold tracking-tight">Send us a message</h2>
            <p className="mt-3 mb-8 leading-relaxed text-ink/60">
              Fill in the form and our export team will get back to you as soon as possible.
            </p>
            <ContactForm product={product} email={contact.email} />
          </div>
        </Container>

        <Container className="mt-6">
          <iframe
            src={contact.mapEmbed}
            title="Demeter Green Earth location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[420px] w-full rounded-[2rem] border-0 bg-brand-50"
          />
        </Container>
      </Section>
    </>
  );
}
