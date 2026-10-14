import { getUser } from '@/admin/session';
import { AdminShell } from '@/admin/ui/shell';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell user={await getUser()}>{children}</AdminShell>;
}
