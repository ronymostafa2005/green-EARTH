import type { Metadata } from 'next';
import Image from 'next/image';
import { getDictionary } from '@/admin/session';
import { LoginForm } from '@/admin/ui/login-form';
import { PreferenceToggles } from '@/admin/ui/preference-toggles';

export const metadata: Metadata = { title: 'Sign in' };

type LoginPageProps = {
  searchParams: Promise<{ next?: string; expired?: string; signedOut?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, expired, signedOut } = await searchParams;
  const t = await getDictionary();
  const notice = expired ? t.auth.expired : signedOut ? t.auth.signedOut : undefined;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 lg:block">
        <Image src="/images/pages/header.jpg" alt="" fill priority sizes="55vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-brand-950/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white">
              <Image src="/images/logo.png" alt="" width={40} height={40} />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold">Demeter Green Earth</span>
              <span className="block text-sm text-white/60">{t.appName}</span>
            </span>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl leading-tight font-bold tracking-tight">{t.auth.brandTitle}</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">{t.auth.brandText}</p>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-col bg-white dark:bg-stone-900">
        <div className="flex items-center justify-between p-5 sm:p-8">
          <span className="flex items-center gap-2 lg:invisible">
            <Image src="/images/logo.png" alt="" width={32} height={32} />
            <span className="text-sm font-bold">Demeter</span>
          </span>
          <PreferenceToggles />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold tracking-tight">{t.auth.title}</h1>
            <p className="mt-2 text-stone-500 dark:text-stone-400">{t.auth.subtitle}</p>
            <LoginForm next={next} notice={notice} noticeIsError={!!expired} />
          </div>
        </div>
      </main>
    </div>
  );
}
