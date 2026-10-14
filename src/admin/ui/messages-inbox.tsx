'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { deleteMessage, markMessageRead } from '../actions';
import { formatDate } from '../messages';
import { adminButton, ConfirmDialog, Dialog, EmptyState, inputStyles, surface } from './controls';
import { AdminIcon } from './icon';
import { useAdmin } from './provider';

export type Message = { id: number; name: string; email: string; subject: string; message: string; date: string | null; isRead: boolean };

export function MessagesInbox({
  messages,
  unreadOnly,
  unreadCount,
  query,
  page,
  totalPages,
  totalCount,
}: {
  messages: Message[];
  unreadOnly: boolean;
  unreadCount: number;
  query: string;
  page: number;
  totalPages: number;
  totalCount: number;
}) {
  const { t, locale, toast } = useAdmin();
  const router = useRouter();
  const [open, setOpen] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const [readIds, setReadIds] = useState<Set<number>>(() => new Set());
  const [pending, startTransition] = useTransition();

  const isRead = (m: Message) => m.isRead || readIds.has(m.id);

  const href = (p: number, filter = unreadOnly) =>
    `/admin/messages?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(filter ? { filter: 'unread' } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  const openMessage = (m: Message) => {
    setOpen(m);
    if (isRead(m)) return;
    setReadIds((ids) => new Set(ids).add(m.id));
    void markMessageRead(m.id).then((result) => {
      if (result.ok) router.refresh();
    });
  };

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
          const params = new URLSearchParams({ ...(q ? { q } : {}), ...(unreadOnly ? { filter: 'unread' } : {}) });
          router.push(`/admin/messages${params.size ? `?${params}` : ''}`);
        }}
        className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <AdminIcon name="search" className="pointer-events-none absolute inset-y-0 start-3 my-auto text-stone-400" />
            <input type="search" name="q" defaultValue={query} placeholder={t.common.search} aria-label={t.common.search} className={cn(inputStyles, 'ps-10')} />
          </div>
          <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-stone-200 dark:bg-white/5 dark:ring-white/10">
            {[
              { filter: false, label: t.common.all },
              { filter: true, label: t.messages.unread, count: unreadCount },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={href(1, tab.filter)}
                aria-current={tab.filter === unreadOnly ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition',
                  tab.filter === unreadOnly
                    ? 'bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950'
                    : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10',
                )}
              >
                {tab.label}
                {!!tab.count && (
                  <span className={cn('rounded-full px-1.5 text-[11px]', tab.filter === unreadOnly ? 'bg-white/20' : 'bg-rose-500 text-white')}>{tab.count}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t.common.total}: <span className="font-semibold text-stone-800 dark:text-stone-200">{totalCount}</span>
        </p>
      </form>

      {messages.length === 0 ? (
        <EmptyState icon="inbox" title={query || unreadOnly ? t.common.noResults : t.messages.empty} text={query || unreadOnly ? undefined : t.messages.emptyText} />
      ) : (
        <ul className={cn('divide-y divide-stone-100 overflow-hidden rounded-3xl dark:divide-white/5', surface)}>
          {messages.map((m) => {
            const unread = !isRead(m);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => openMessage(m)}
                  className={cn(
                    'relative flex w-full items-start gap-4 px-5 py-4 text-start transition-colors hover:bg-stone-50 dark:hover:bg-white/[0.03]',
                    unread && 'bg-brand-50/50 before:absolute before:inset-y-3 before:start-0 before:w-1 before:rounded-e-full before:bg-brand-500 dark:bg-brand-500/[0.06]',
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 uppercase dark:bg-brand-500/15 dark:text-brand-200">
                    {(m.name || m.email).charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={cn('flex min-w-0 items-center gap-2 truncate', unread ? 'font-bold' : 'font-semibold')}>
                        <span className="truncate">{m.name || m.email}</span>
                        {unread && (
                          <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-brand-500 dark:text-brand-950">
                            {t.messages.new}
                          </span>
                        )}
                      </span>
                      {formatDate(m.date, locale) && <span className="shrink-0 text-xs text-stone-400">{formatDate(m.date, locale)}</span>}
                    </span>
                    <span className={cn('mt-0.5 block truncate text-sm text-stone-700 dark:text-stone-300', unread ? 'font-semibold' : 'font-medium')}>
                      {m.subject || t.messages.noSubject}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-stone-500 dark:text-stone-400">{m.message}</span>
                  </span>
                </button>
              </li>
            );
          })}
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
