import Link from 'next/link';
import { Logo } from './logo';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { footerNav, siteConfig } from '@/config/site';
import { getContactInfo, getSocialLinks } from '@/lib/site-content';

export async function SiteFooter() {
  const [contact, socialLinks] = await Promise.all([getContactInfo(), getSocialLinks()]);

  return (
    <footer className="overflow-hidden bg-brand-950 text-white">
      <Container className="pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
              Premium IQF frozen fruits and vegetables, grown in Egypt’s fertile lands and delivered to tables around
              the world.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
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
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-sand-300">{group.title}</h3>
              <ul className="mt-5 space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/65 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-sand-300">Get in touch</h3>
            <ul className="mt-5 space-y-4 text-sm text-white/65">
              <li className="flex gap-3">
                <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-brand-400" />
                {contact.address}
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="flex gap-3 transition-colors hover:text-white">
                  <Icon name="phone" size={18} className="shrink-0 text-brand-400" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex gap-3 transition-colors hover:text-white">
                  <Icon name="mail" size={18} className="shrink-0 text-brand-400" />
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 py-8 text-sm text-white/45 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Grown in Egypt · Shipped worldwide</p>
        </div>
      </Container>

      <p
        aria-hidden
        className="-mb-[3vw] text-center text-[17vw] leading-none font-bold tracking-tighter whitespace-nowrap text-white/[0.04] select-none"
      >
        DEMETER
      </p>
    </footer>
  );
}
