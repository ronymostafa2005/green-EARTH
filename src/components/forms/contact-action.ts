'use server';

import { ApiError, createContactMessage } from '@/lib/api';

export type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function sendContactMessage(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const field = (key: string) => String(formData.get(key) ?? '').trim();

  const name = field('name');
  const email = field('email');
  const company = field('company');
  const country = field('country');
  const subject = field('subject') || `Inquiry from ${name}${company ? ` – ${company}` : ''}`;
  const details = [company && `Company: ${company}`, country && `Country: ${country}`].filter(Boolean);
  const message = [...details, ...(details.length ? [''] : []), field('message')].join('\n');

  if (!name || !email || !field('message')) {
    return { status: 'error', message: 'Please fill in your name, email and message.' };
  }

  try {
    await createContactMessage({ name, email, subject, message });
    return { status: 'success' };
  } catch (error) {
    if (error instanceof ApiError && error.errors.length) {
      return { status: 'error', message: error.errors.join(' ') };
    }
    console.error('Failed to send contact message.', error);
    return { status: 'error', message: 'Something went wrong. Please try again or email us directly.' };
  }
}
