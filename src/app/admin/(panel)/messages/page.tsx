import type { Metadata } from 'next';
import { listPage } from '@/admin/api';
import { toMessage } from '@/admin/messages';
import { getDictionary } from '@/admin/session';
import { MessagesInbox } from '@/admin/ui/messages-inbox';
import { PageHeader } from '@/admin/ui/page-header';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).messages.title };
}

type MessagesPageProps = { searchParams: Promise<{ page?: string; q?: string; filter?: string }> };

const PAGE_SIZE = 20;

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { page, q = '', filter } = await searchParams;
  const unreadOnly = filter === 'unread';
  const pageNumber = Math.max(1, Number(page) || 1);
  const t = await getDictionary();
  const [result, unread] = await Promise.all([
    listPage('ContactUs', { pageNumber, pageSize: PAGE_SIZE, search: q, isRead: unreadOnly ? false : undefined }),
    listPage('ContactUs', { pageNumber: 1, pageSize: 1, isRead: false })
      .then((r) => r?.totalCount ?? 0)
      .catch(() => 0),
  ]);

  return (
    <>
      <PageHeader title={t.messages.title} description={t.messages.description} />
      <MessagesInbox
        key={`${filter ?? 'all'}-${q}-${pageNumber}`}
        messages={(result?.data ?? []).map(toMessage)}
        unreadOnly={unreadOnly}
        unreadCount={unread}
        query={q}
        page={result?.currentPage ?? pageNumber}
        totalPages={result?.totalPages ?? 1}
        totalCount={result?.totalCount ?? 0}
      />
    </>
  );
}
