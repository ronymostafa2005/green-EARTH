import type { Metadata } from 'next';
import { listPage } from '@/admin/api';
import { toMessage } from '@/admin/messages';
import { getDictionary } from '@/admin/session';
import { MessagesInbox } from '@/admin/ui/messages-inbox';
import { PageHeader } from '@/admin/ui/page-header';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).messages.title };
}

type MessagesPageProps = { searchParams: Promise<{ page?: string; q?: string }> };

const PAGE_SIZE = 20;

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { page, q = '' } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);
  const t = await getDictionary();
  const result = await listPage('ContactUs', { pageNumber, pageSize: PAGE_SIZE, search: q });

  return (
    <>
      <PageHeader title={t.messages.title} description={t.messages.description} />
      <MessagesInbox
        messages={(result?.data ?? []).map(toMessage)}
        query={q}
        page={result?.currentPage ?? pageNumber}
        totalPages={result?.totalPages ?? 1}
        totalCount={result?.totalCount ?? 0}
      />
    </>
  );
}
