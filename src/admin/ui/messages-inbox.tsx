'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { deleteMessage } from '../actions';
import { formatDate } from '../messages';
import { adminButton, ConfirmDialog, Dialog, EmptyState, inputStyles, surface } from './controls';
import { AdminIcon } from './icon';
import { useAdmin } from './provider';

export type Message = { id: number; name: string; email: string; subject: string; message: string; date: string | null };

export function MessagesInbox({
  messages,
  query,
  page,
  totalPages,
  totalCount,
}: {
  messages: Message[];
  query: string;
  page: number;
  totalPages: number;
  totalCount: number;
}) {
  const { t, locale, toast } = useAdmin();
  const router = useRouter();
  const [open, setOpen] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();

  const href = (p: number) => `/admin/messages?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  const confirmDelete = () =>
    startTransition(async () => {
      if (!deleting) return;
      const result = await deleteMessage(deleting.id);
      toast(result.ok, result.message);
      if (result.ok) {
        setDeleting(null);
        setOpen(null);
      }
    });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
          router.push(q ? `/admin/messages?q=${encodeURIComponent(q)}` : '/admin/messages');
        }}
        className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative w-full sm:max-w-xs">
          <AdminIcon name="search" className="pointer-events-none absolute inset-y-0 start-3 my-auto text-stone-400" />
          <input type="search" name="q" defaultValue={query} placeholder={t.common.search} aria-label={t.common.search} className={cn(inputStyles, 'ps-10')} />
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t.common.total}: <span className="font-semibold text-stone-800 dark:text-stone-200">{totalCount}</span>
        </p>
      </form>

      {messages.length === 0 ? (
        <EmptyState icon="inbox" title={query ? t.common.noResults : t.messages.empty} text={query ? undefined : t.messages.emptyText} />
      ) : (
        <ul className={cn('divide-y divide-stone-100 overflow-hidden rounded-3xl dark:divide-white/5', surface)}>
          {messages.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setOpen(m)} className="flex w-full items-start gap-4 px-5 py-4 text-start transition-colors hover:bg-stone-50 dark:hover:bg-white/[0.03]">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 uppercase dark:bg-brand-500/15 dark:text-brand-200">
                  {(m.name || m.email).charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold">{m.name || m.email}</span>
                    {formatDate(m.date, locale) && <span className="shrink-0 text-xs text-stone-400">{formatDate(m.date, locale)}</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium text-stone-700 dark:text-stone-300">{m.subject || t.messages.noSubject}</span>
                  <span className="mt-0.5 block truncate text-sm text-stone-500 dark:text-stone-400">{m.message}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-3 text-sm" aria-label="Pagination">
          <Link href={href(page - 1)} aria-disabled={page <= 1} className={adminButton({ variant: 'secondary', size: 'sm', className: cn(page <= 1 && 'pointer-events-none opacity-50') })}>
            {t.common.previous}
          </Link>
          <span className="text-stone-500 dark:text-stone-400">
            {t.common.page} {page} {t.common.of} {totalPages}
          </span>
          <Link href={href(page + 1)} aria-disabled={page >= totalPages} className={adminButton({ variant: 'secondary', size: 'sm', className: cn(page >= totalPages && 'pointer-events-none opacity-50') })}>
            {t.common.next}
          </Link>
        </nav>
      )}

      <Dialog open={open !== null} onClose={() => setOpen(null)} title={open?.subject || t.messages.noSubject} description={formatDate(open?.date ?? null, locale) ?? undefined}>
        {open && (
          <div className="grid gap-5">
            <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4 dark:bg-white/[0.03]">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-800 uppercase dark:bg-brand-500/15 dark:text-brand-200">
                {(open.name || open.email).charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{open.name}</p>
                <a href={`mailto:${open.email}`} className="block truncate text-sm text-brand-700 hover:underline dark:text-brand-300" dir="ltr">
                  {open.email}
                </a>
              </div>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap text-stone-700 dark:text-stone-200" dir="auto">
              {open.message}
            </p>
            <div className="flex flex-wrap justify-between gap-2 border-t border-stone-100 pt-5 dark:border-white/5">
              <button type="button" onClick={() => setDeleting(open)} className={adminButton({ variant: 'dangerGhost' })}>
                <AdminIcon name="trash" size={16} />
                {t.common.delete}
              </button>
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}
                className={adminButton()}
              >
                <AdminIcon name="reply" className="rtl:-scale-x-100" />
                {t.messages.reply}
              </a>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={confirmDelete} pending={pending} />
    </>
  );
}
