'use client';

import { startTransition, useActionState } from 'react';
import { buttonStyles } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { siteConfig } from '@/config/site';
import { sendContactMessage, type ContactFormState } from './contact-action';

const inputStyles =
  'w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-ink/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-100';

const initialState: ContactFormState = { status: 'idle' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function ContactForm({ product, email = siteConfig.contact.email }: { product?: string; email?: string }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  if (state.status === 'success') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-white p-6 text-brand-700">
        <Icon name="check" size={20} />
        <p className="text-sm leading-relaxed">
          Thank you! Your message has been sent — our export team will get back to you soon.
        </p>
      </div>
    );
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

      <Field label="Subject">
        <input
          name="subject"
          defaultValue={product ? `Inquiry about ${product}` : ''}
          placeholder="Price offer, samples, partnership…"
          className={inputStyles}
        />
      </Field>

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
        <button type="submit" disabled={pending} className={`${buttonStyles({ size: 'lg' })} disabled:cursor-wait disabled:opacity-60`}>
          {pending ? 'Sending…' : 'Send message'}
          <Icon name="arrow" />
        </button>
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-red-600">
            {state.message} You can also write to {email}.
          </p>
        )}
      </div>
    </form>
  );
}
