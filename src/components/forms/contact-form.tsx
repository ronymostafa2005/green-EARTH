'use client';

import { useState } from 'react';
import { buttonStyles } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { siteConfig } from '@/config/site';

const inputStyles =
  'w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-ink/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-100';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function ContactForm({ product }: { product?: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    const subject = `Inquiry from ${data.name}${data.company ? ` – ${data.company}` : ''}`;
    const body = [
      `Name: ${data.name}`,
      `Company: ${data.company}`,
      `Email: ${data.email}`,
      `Country: ${data.country}`,
      '',
      data.message,
    ].join('\n');

    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name">
          <input name="name" required autoComplete="name" className={inputStyles} />
        </Field>
        <Field label="Company">
          <input name="company" autoComplete="organization" className={inputStyles} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" className={inputStyles} />
        </Field>
        <Field label="Country">
          <input name="country" autoComplete="country-name" className={inputStyles} />
        </Field>
      </div>

      <Field label="Message">
        <textarea
          name="message"
          rows={5}
          required
          defaultValue={product ? `I'm interested in ${product}. Please send me your offer.` : ''}
          placeholder="Products, quantities, packing…"
          className={`${inputStyles} resize-y`}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={buttonStyles({ size: 'lg' })}>
          Send message
          <Icon name="arrow" />
        </button>
        {sent && (
          <p className="text-sm text-brand-700">
            Your email app should open now. If not, write to {siteConfig.contact.email}.
          </p>
        )}
      </div>
    </form>
  );
}
