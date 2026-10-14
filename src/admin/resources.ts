import { socialPlatforms } from '@/lib/site-content';

export type FieldType = 'text' | 'textarea' | 'image' | 'url' | 'number' | 'boolean' | 'select';

export type FieldKey =
  | 'name'
  | 'description'
  | 'location'
  | 'year'
  | 'image'
  | 'title'
  | 'subtitle'
  | 'buttonText'
  | 'link'
  | 'displayOrder'
  | 'isActive'
  | 'platform'
  | 'url';

export type ResourceField = {
  key: FieldKey;
  type: FieldType;
  /** Also edits `${key}Localization` (Arabic). */
  localized?: boolean;
  required?: boolean;
  options?: readonly string[];
};

export type ResourceKey =
  | 'categories'
  | 'certifications'
  | 'exhibitions'
  | 'types'
  | 'packing-types'
  | 'vitamins'
  | 'minerals'
  | 'banners'
  | 'social';

export type ResourceConfig = {
  endpoint: string;
  body: 'json' | 'form';
  fields: ResourceField[];
  /** Field shown as the row title (defaults to `name`). */
  titleKey?: FieldKey;
  /** Multipart field name for the uploaded file. */
  fileField?: string;
  /** Response field that holds the image path. */
  imageKey?: string;
  view: 'grid' | 'table';
  /** Public data tags to refresh after a change. */
  tags: string[];
};

const name: ResourceField = { key: 'name', type: 'text', localized: true, required: true };
const description: ResourceField = { key: 'description', type: 'textarea', localized: true };
const image: ResourceField = { key: 'image', type: 'image' };
const displayOrder: ResourceField = { key: 'displayOrder', type: 'number' };
const isActive: ResourceField = { key: 'isActive', type: 'boolean' };

export const resources: Record<ResourceKey, ResourceConfig> = {
  categories: {
    endpoint: 'ProductCategory',
    body: 'json',
    fields: [name, description],
    view: 'table',
    tags: ['products'],
  },
  certifications: {
    endpoint: 'Certification',
    body: 'form',
    fields: [name, description, image],
    fileField: 'CertificationUrlFile',
    imageKey: 'certificationUrl',
    view: 'grid',
    tags: ['certifications'],
  },
  exhibitions: {
    endpoint: 'Exhibition',
    body: 'form',
    fields: [
      name,
      { key: 'location', type: 'text' },
      { key: 'year', type: 'text' },
      description,
      image,
    ],
    fileField: 'ExhibitionUrlFile',
    imageKey: 'exhibitionUrl',
    view: 'grid',
    tags: ['exhibitions'],
  },
  types: {
    endpoint: 'Type',
    body: 'json',
    fields: [name, description],
    view: 'table',
    tags: ['products'],
  },
  'packing-types': {
    endpoint: 'PackingType',
    body: 'json',
    fields: [name],
    view: 'table',
    tags: ['products'],
  },
  vitamins: {
    endpoint: 'Vitamin',
    body: 'form',
    fields: [name, image],
    fileField: 'VitaminUrlFile',
    imageKey: 'vitaminUrl',
    view: 'grid',
    tags: ['products'],
  },
  minerals: {
    endpoint: 'Mineral',
    body: 'form',
    fields: [name, image],
    fileField: 'MineralUrlFile',
    imageKey: 'mineralUrl',
    view: 'grid',
    tags: ['products'],
  },
  banners: {
    endpoint: 'Banner',
    body: 'form',
    titleKey: 'title',
    fields: [
      { key: 'title', type: 'text', localized: true, required: true },
      { key: 'subtitle', type: 'textarea', localized: true },
      { key: 'buttonText', type: 'text', localized: true },
      { key: 'link', type: 'text' },
      displayOrder,
      isActive,
      image,
    ],
    fileField: 'ImageFile',
    imageKey: 'image',
    view: 'grid',
    tags: ['banners'],
  },
  social: {
    endpoint: 'SocialMedia',
    body: 'json',
    titleKey: 'platform',
    fields: [{ key: 'platform', type: 'select', required: true, options: socialPlatforms }, { key: 'url', type: 'url', required: true }, displayOrder, isActive],
    view: 'table',
    tags: ['social'],
  },
};

export const isResourceKey = (value: string): value is ResourceKey => value in resources;

export type ProductLinkKind = 'types' | 'packing' | 'vitamins' | 'minerals';

export const productLinks: Record<ProductLinkKind, { link: string; lookup: string; idKey: string; lookupPage: ResourceKey; creatable: boolean }> = {
  types: { link: 'ProductType', lookup: 'Type', idKey: 'typeId', lookupPage: 'types', creatable: true },
  packing: { link: 'ProductPacking', lookup: 'PackingType', idKey: 'packingTypeId', lookupPage: 'packing-types', creatable: true },
  vitamins: { link: 'ProductVitamin', lookup: 'Vitamin', idKey: 'vitaminId', lookupPage: 'vitamins', creatable: false },
  minerals: { link: 'ProductMineral', lookup: 'Mineral', idKey: 'mineralId', lookupPage: 'minerals', creatable: false },
};

export const isProductLinkKind = (value: string): value is ProductLinkKind => value in productLinks;

export type Row = Record<string, unknown> & { id: number };

const str = (value: unknown) => (typeof value === 'string' ? value : '');

export function rowName(row: Row, locale: 'ar' | 'en', titleKey: string = 'name') {
  const en = str(row[titleKey]);
  const ar = str(row[`${titleKey}Localization`]);
  return locale === 'ar' ? ar || en : en || ar;
}

export function rowImagePath(row: Row, imageKey?: string) {
  if (imageKey && typeof row[imageKey] === 'string') return row[imageKey] as string;
  const entry = Object.entries(row).find(([k, v]) => /(image|url|path)$/i.test(k) && k !== 'url' && typeof v === 'string' && v);
  return entry ? (entry[1] as string) : null;
}
