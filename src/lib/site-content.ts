import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { API_BASE_URL, apiAssetUrl, USE_MOCK_DATA, type ApiResponse, type PaginatedList } from './api';

const REVALIDATE_SECONDS = 300;

export const siteSectionKeys = ['welcome', 'about', 'quality', 'export'] as const;
export type SiteSectionKey = (typeof siteSectionKeys)[number];

export const metaPages = ['home', 'about', 'products', 'certifications', 'exhibitions', 'export', 'quality', 'contact'] as const;
export type MetaPage = (typeof metaPages)[number];

export const sectionIcons = ['leaf', 'shield', 'snowflake', 'globe', 'check', 'pin', 'phone', 'mail'] as const;
export type SectionIcon = (typeof sectionIcons)[number];

export type SiteSectionItem = {
  title: string | null;
  titleLocalization: string | null;
  description: string | null;
  descriptionLocalization: string | null;
  icon: string | null;
};

export type SiteSection = {
  id: number;
  key: string;
  title: string | null;
  titleLocalization: string | null;
  details: string | null;
  detailsLocalization: string | null;
  image: string | null;
  items: SiteSectionItem[] | null;
};

export type Banner = {
  id: number;
  title: string | null;
  titleLocalization: string | null;
  subtitle: string | null;
  subtitleLocalization: string | null;
  image: string | null;
  buttonText: string | null;
  buttonTextLocalization: string | null;
  link: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
};

export type SocialMedia = { id: number; platform: string; url: string; displayOrder: number | null; isActive: boolean | null };

export type MetaTag = {
  id: number;
  page: string;
  title: string | null;
  titleLocalization: string | null;
  description: string | null;
  descriptionLocalization: string | null;
  keywords: string | null;
  ogImage: string | null;
};

export type CompanySettings = {
  phones: string[] | null;
  emails: string[] | null;
  whatsapp: string | null;
  address: string | null;
  addressLocalization: string | null;
  mapUrl: string | null;
  workingHours: string | null;
  workingHoursLocalization: string | null;
  notificationEmail: string | null;
};

/** Public content must never break a page, so any failure falls back to the built-in copy. */
async function load<T>(path: string, tags: string[], body?: unknown): Promise<T | null> {
  if (USE_MOCK_DATA) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: REVALIDATE_SECONDS, tags },
    });
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!res.ok || !json?.succeeded) return null;
    return json.data ?? null;
  } catch (error) {
    console.error(`[content] ${path} failed`, error);
    return null;
  }
}

const filled = (value: string | null | undefined): value is string => typeof value === 'string' && value.trim().length > 0;
const byOrder = (a: { displayOrder: number | null }, b: { displayOrder: number | null }) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0);

export function safeHref(value: string | null | undefined) {
  if (!filled(value)) return null;
  const href = value.trim();
  return href.startsWith('/') || /^https?:\/\//i.test(href) || /^(mailto|tel):/i.test(href) ? href : null;
}

/** Splits stored text (plain or HTML from the old dashboard) into plain paragraphs. */
export function paragraphs(value: string | null | undefined): string[] {
  if (!filled(value)) return [];
  return value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/* ---------- Site sections ---------- */

export type SectionContent = {
  title: string | null;
  paragraphs: string[];
  image: string | null;
  items: { title: string; description: string; icon: SectionIcon }[];
};

export async function getSiteSection(key: SiteSectionKey): Promise<SectionContent | null> {
  const section = await load<SiteSection>(`SiteSection/GetByKey/${key}`, ['site-sections', `section-${key}`]);
  if (!section) return null;
  const content: SectionContent = {
    title: filled(section.title) ? section.title.trim() : null,
    paragraphs: paragraphs(section.details),
    image: apiAssetUrl(section.image),
    items: (section.items ?? [])
      .filter((item) => filled(item.title))
      .map((item) => ({
        title: item.title!.trim(),
        description: item.description?.trim() ?? '',
        icon: (sectionIcons as readonly string[]).includes(item.icon ?? '') ? (item.icon as SectionIcon) : 'check',
      })),
  };
  return content.title || content.paragraphs.length || content.image || content.items.length ? content : null;
}

/* ---------- Banner ---------- */

export async function getHeroBanner() {
  const page = await load<PaginatedList<Banner>>('Banner/GetPaginatedList', ['banners'], { pageNumber: 1, pageSize: 20, isActive: true });
  const banner = (page?.data ?? []).filter((b) => b.isActive !== false && filled(b.title)).sort(byOrder)[0];
  if (!banner) return null;
  return {
    title: banner.title!.trim(),
    subtitle: banner.subtitle?.trim() || null,
    image: apiAssetUrl(banner.image),
    buttonText: banner.buttonText?.trim() || null,
    link: safeHref(banner.link),
  };
}

/* ---------- Social media ---------- */

export const socialPlatforms = ['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'tiktok', 'whatsapp'] as const;
export type SocialPlatform = (typeof socialPlatforms)[number];

const platformLabels: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};

export type SocialLink = { label: string; icon: SocialPlatform; href: string };

export async function getSocialLinks(): Promise<SocialLink[]> {
  const page = await load<PaginatedList<SocialMedia>>('SocialMedia/GetPaginatedList', ['social'], { pageNumber: 1, pageSize: 50, isActive: true });
  const links = (page?.data ?? [])
    .filter((s) => s.isActive !== false)
    .sort(byOrder)
    .flatMap((s) => {
      const icon = s.platform?.toLowerCase() as SocialPlatform;
      const href = safeHref(s.url);
      return socialPlatforms.includes(icon) && href ? [{ label: platformLabels[icon], icon, href }] : [];
    });
  if (links.length) return links;

  const contact = await getContactInfo();
  return [
    { label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/profile.php?id=100076464270893' },
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/demeter-green-earth-8bb011216' },
    { label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/${contact.whatsapp}` },
  ];
}

/* ---------- Company settings ---------- */

export type ContactInfo = {
  phone: string;
  phones: string[];
  email: string;
  emails: string[];
  whatsapp: string;
  address: string;
  workingHours: string | null;
  mapEmbed: string;
};

/** Only Google "embed" links can be framed; any other map link falls back to searching the address. */
function toMapEmbed(mapUrl: string | null | undefined, address: string) {
  const raw = mapUrl?.trim() ?? '';
  const src = raw.match(/src="([^"]+)"/)?.[1] ?? raw;
  if (/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(src)) return src;
  if (address === siteConfig.contact.address) return siteConfig.mapEmbed;
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export async function getContactInfo(): Promise<ContactInfo> {
  const settings = await load<CompanySettings>('CompanySettings/Get', ['company-settings']);
  const fallback = siteConfig.contact;
  const phones = (settings?.phones ?? []).filter(filled).map((p) => p.trim());
  const emails = (settings?.emails ?? []).filter(filled).map((e) => e.trim());
  const address = filled(settings?.address) ? settings.address.trim() : fallback.address;
  return {
    phone: phones[0] ?? fallback.phone,
    phones: phones.length ? phones : [fallback.phone],
    email: emails[0] ?? fallback.email,
    emails: emails.length ? emails : [fallback.email],
    whatsapp: filled(settings?.whatsapp) ? settings.whatsapp.replace(/\D/g, '') : fallback.whatsapp,
    address,
    workingHours: filled(settings?.workingHours) ? settings.workingHours.trim() : null,
    mapEmbed: toMapEmbed(settings?.mapUrl, address),
  };
}

/* ---------- Meta tags ---------- */

export async function pageMetadata(page: MetaPage, fallback: Metadata): Promise<Metadata> {
  const meta = await load<MetaTag>(`MetaTag/GetByPage/${page}`, ['meta-tags', `meta-${page}`]);
  if (!meta) return fallback;
  const title = filled(meta.title) ? meta.title.trim() : undefined;
  const description = filled(meta.description) ? meta.description.trim() : undefined;
  const image = apiAssetUrl(meta.ogImage);
  const keywords = filled(meta.keywords)
    ? meta.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;
  if (!title && !description && !image && !keywords) return fallback;

  const finalTitle = title ? (page === 'home' ? { absolute: title } : title) : fallback.title;
  const finalDescription = description ?? fallback.description;
  return {
    ...fallback,
    title: finalTitle,
    description: finalDescription,
    keywords: keywords ?? fallback.keywords,
    openGraph: {
      siteName: siteConfig.name,
      type: 'website',
      images: [image ?? '/images/pages/header.jpg'],
      ...fallback.openGraph,
      ...(title ? { title } : {}),
      ...(finalDescription ? { description: finalDescription } : {}),
      ...(image ? { images: [image] } : {}),
    },
  };
}
