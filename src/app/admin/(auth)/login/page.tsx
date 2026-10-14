import type { Metadata } from 'next';
import Image from 'next/image';
import { getDictionary } from '@/admin/session';
import { AdminIcon } from '@/admin/ui/icon';
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
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 lg:block">
        <Image
          src="/images/pages/header.jpg"
          alt=""
          fill
          priority
          sizes="55vw"
          className="animate-ken-burns object-cover opacity-50"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/20" />
        <div aria-hidden className="absolute -start-24 -bottom-24 size-96 rounded-full bg-brand-500/25 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-14">
          <div className="flex animate-fade-up items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white shadow-lg shadow-black/20">
              <Image src="/images/logo.png" alt="" width={40} height={40} />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold">Demeter Green Earth</span>
              <span className="block text-sm text-white/60">{t.appName}</span>
            </span>
          </div>

          <div className="max-w-lg">
            <h2 className="animate-fade-up text-4xl leading-tight font-bold tracking-tight [animation-delay:120ms] xl:text-5xl xl:leading-[1.1]">
              {t.auth.brandTitle}
            </h2>
            <p className="mt-4 animate-fade-up text-lg leading-relaxed text-white/70 [animation-delay:200ms]">{t.auth.brandText}</p>

            <ul className="mt-10 grid gap-3">
              {t.auth.features.map((feature, i) => (
                <li
                  key={feature.title}
                  style={{ animationDelay: `${300 + i * 90}ms` }}
                  className="flex animate-fade-up items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md transition-colors hover:bg-white/[0.11]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/20 text-brand-200 ring-1 ring-brand-400/30">
                    <AdminIcon name={feature.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{feature.title}</span>
                    <span className="block text-sm text-white/60">{feature.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/45">© {new Date().getFullYear()} Demeter Green Earth</p>
        </div>
      </aside>

      <main className="relative isolate flex flex-col overflow-hidden bg-[#f4f6ef] dark:bg-[#0f110d]">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,rgb(130_174_70/0.16),transparent_45%),radial-gradient(circle_at_0%_100%,rgb(227_196_156/0.22),transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_0%,rgb(130_174_70/0.14),transparent_45%),radial-gradient(circle_at_0%_100%,rgb(130_174_70/0.06),transparent_40%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background-image:linear-gradient(rgb(19_33_13/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(19_33_13/0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:[background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)]"
        />

        <div className="flex items-center justify-between p-5 sm:p-8">
          <a href="/" className="flex items-center gap-2 text-stone-800 lg:invisible dark:text-stone-100">
            <Image src="/images/logo.png" alt="" width={32} height={32} />
            <span className="text-sm font-bold">Demeter</span>
          </a>
          <PreferenceToggles />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="w-full max-w-[26rem] animate-fade-up">
            <div className="rounded-[2rem] bg-white/90 p-7 shadow-[0_1px_2px_rgb(19_33_13/0.05),0_30px_70px_-30px_rgb(19_33_13/0.35)] ring-1 ring-brand-950/[0.07] backdrop-blur-xl sm:p-9 dark:bg-[#161914]/90 dark:shadow-[0_30px_70px_-30px_rgb(0_0_0/0.8)] dark:ring-white/[0.08]">
              <span className="grid size-14 animate-float place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 shadow-inner ring-1 ring-brand-600/10 dark:from-brand-500/15 dark:to-brand-500/5 dark:ring-brand-400/20">
                <Image src="/images/logo.png" alt="" width={38} height={38} />
              </span>
              <h1 className="mt-6 text-[1.75rem] leading-tight font-bold tracking-tight text-brand-950 dark:text-white">{t.auth.title}</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-stone-500 dark:text-stone-400">{t.auth.subtitle}</p>
              <LoginForm next={next} notice={notice} noticeIsError={!!expired} />
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 px-2 text-[13px] text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <AdminIcon name="lock" size={14} className="text-brand-600 dark:text-brand-400" />
                {t.auth.secure}
              </span>
              <a href="/" className="flex items-center gap-1 font-medium transition-colors hover:text-brand-700 dark:hover:text-brand-300">
                {t.auth.backToSite}
                <AdminIcon name="chevron" size={14} className="rtl:rotate-180" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
