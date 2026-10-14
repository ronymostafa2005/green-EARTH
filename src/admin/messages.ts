import type { Message } from './ui/messages-inbox';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export function formatDate(value: string | null, locale: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function toMessage(row: Record<string, unknown> & { id: number }): Message {
  const date = ['createdAt', 'createdDate', 'creationDate', 'date', 'sentAt'].map((k) => str(row[k])).find(Boolean);
  return { id: row.id, name: str(row.name), email: str(row.email), subject: str(row.subject), message: str(row.message), date: date || null };
}
