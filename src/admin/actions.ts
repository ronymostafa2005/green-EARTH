'use server';

import { cookies } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { API_BASE_URL, ApiError } from '@/lib/api';
import { setProductHidden } from '@/lib/visibility';
import { createItem, deleteItem, listAll, updateItem } from './api';
import { dictionaries, isLocale, isTheme } from './i18n';
import { isProductLinkKind, isResourceKey, productLinks, resources, type Row } from './resources';
import {
  decodeJwtExpiry,
  getDictionary,
  getPrefs,
  LOCALE_COOKIE,
  THEME_COOKIE,
  TOKEN_COOKIE,
  USER_COOKIE,
  type AdminUser,
} from './session';

export type ActionResult = { ok: boolean; message?: string; at?: number };

const YEAR = 60 * 60 * 24 * 365;

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();
const files = (formData: FormData, key: string) =>
  formData.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
const numbers = (formData: FormData, key: string) =>
  formData
    .getAll(key)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);

const pascal = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

async function errorResult(error: unknown): Promise<ActionResult> {
  unstable_rethrow(error);
  const dict = await getDictionary();
  const message =
    error instanceof ApiError ? [error.message, ...error.errors].filter(Boolean).join(' — ') || dict.common.error : dict.common.error;
  if (!(error instanceof ApiError)) console.error('[admin] action failed', error);
  return { ok: false, message, at: Date.now() };
}

async function success(kind: 'saved' | 'created' | 'deleted'): Promise<ActionResult> {
  const dict = await getDictionary();
  return { ok: true, message: dict.common[kind], at: Date.now() };
}

function refresh(tags: string[], ...paths: string[]) {
  tags.forEach((tag) => revalidateTag(tag));
  paths.forEach((path) => revalidatePath(path));
}

/* ---------- Auth & preferences ---------- */

function pickString(source: unknown, keys: string[]): string | undefined {
  if (!source || typeof source !== 'object') return undefined;
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

function readSignIn(data: unknown, email: string) {
  if (typeof data === 'string') return { token: data, user: { name: email.split('@')[0], email } };

  const nested = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const token =
    pickString(nested, ['accessToken', 'token', 'jwtToken', 'jwt']) ??
    pickString(nested.accessToken, ['token', 'value']) ??
    pickString(nested.token, ['token', 'value', 'accessToken']);
  const userSource = (nested.user as Record<string, unknown> | undefined) ?? nested;
  const user: AdminUser = {
    name: pickString(userSource, ['name', 'fullName', 'userName', 'displayName']) ?? email.split('@')[0],
    email: pickString(userSource, ['email']) ?? email,
    image: pickString(userSource, ['profileImageUrl', 'imageUrl', 'image']) ?? null,
  };
  return { token, user };
}

export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { locale } = await getPrefs();
  const dict = dictionaries[locale];
  const email = text(formData, 'email');
  const password = String(formData.get('password') ?? '');
  const remember = formData.get('remember') === 'on';
  const next = text(formData, 'next');

  if (!email || !password) return { ok: false, message: dict.auth.invalid, at: Date.now() };

  let token: string | undefined;
  let user: AdminUser;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/Authentication/SignIn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': locale },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
    const json = (await res.json().catch(() => null)) as { succeeded?: boolean; message?: string; data?: unknown } | null;

    if (!res.ok || !json?.succeeded) {
      console.warn(`[admin] sign in rejected: ${res.status} ${json?.message ?? ''}`);
      const message =
        res.status === 404 ? dict.auth.notFound : [400, 401, 403].includes(res.status) ? dict.auth.invalid : (json?.message ?? dict.common.error);
      return { ok: false, message, at: Date.now() };
    }
    ({ token, user } = readSignIn(json.data, email));
  } catch (error) {
    console.error('[admin] sign in failed', error);
    return { ok: false, message: dict.common.error, at: Date.now() };
  }

  if (!token) {
    console.error('[admin] sign in response did not include a token');
    return { ok: false, message: dict.common.error, at: Date.now() };
  }

  const expiry = decodeJwtExpiry(token);
  const maxAge = expiry ? Math.max(60, Math.floor((expiry - Date.now()) / 1000)) : remember ? 60 * 60 * 24 * 30 : undefined;
  const store = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(remember || expiry ? { maxAge } : {}),
  };
  store.set(TOKEN_COOKIE, token, options);
  store.set(USER_COOKIE, JSON.stringify(user), options);

  redirect(next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin');
}

export async function setPreference(name: 'locale' | 'theme', value: string) {
  const store = await cookies();
  if (name === 'locale' && isLocale(value)) store.set(LOCALE_COOKIE, value, { path: '/', maxAge: YEAR, sameSite: 'lax' });
  if (name === 'theme' && isTheme(value)) store.set(THEME_COOKIE, value, { path: '/', maxAge: YEAR, sameSite: 'lax' });
}

export async function signOut() {
  redirect('/admin/logout');
}

/* ---------- Simple resources ---------- */

export async function saveResource(key: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isResourceKey(key)) return { ok: false, at: Date.now() };
  const config = resources[key];
  const id = Number(formData.get('id')) || undefined;

  try {
    const values: Record<string, string> = {};
    for (const field of config.fields) {
      if (field.type === 'image') continue;
      values[field.key] = text(formData, field.key);
      if (field.localized) values[`${field.key}Localization`] = text(formData, `${field.key}Localization`);
    }

    let body: Record<string, unknown> | FormData;
    if (config.body === 'json') {
      body = id ? { id, ...values } : values;
    } else {
      const form = new FormData();
      if (id) form.append('Id', String(id));
      Object.entries(values).forEach(([k, v]) => form.append(pascal(k), v));
      const [file] = files(formData, 'image');
      if (file && config.fileField) form.append(config.fileField, file);
      body = form;
    }

    await (id ? updateItem(config.endpoint, body) : createItem(config.endpoint, body));
    refresh(config.tags, `/admin/${key}`, '/admin');
    return success(id ? 'saved' : 'created');
  } catch (error) {
    return errorResult(error);
  }
}

export async function deleteResource(key: string, id: number): Promise<ActionResult> {
  if (!isResourceKey(key)) return { ok: false, at: Date.now() };
  try {
    await deleteItem(resources[key].endpoint, id);
    refresh(resources[key].tags, `/admin/${key}`, '/admin');
    return success('deleted');
  } catch (error) {
    return errorResult(error);
  }
}

/* ---------- Products ---------- */

const productPaths = (id?: number) => ['/admin/products', '/admin', ...(id ? [`/admin/products/${id}`] : [])];

export async function createProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const form = new FormData();
    form.append('Name', text(formData, 'name'));
    form.append('NameLocalization', text(formData, 'nameLocalization'));
    form.append('Description', text(formData, 'description'));
    form.append('DescriptionLocalization', text(formData, 'descriptionLocalization'));
    form.append('ProductCategoryId', text(formData, 'productCategoryId'));
    files(formData, 'images').forEach((file) => form.append('Images', file));
    for (const [from, to] of [
      ['varieties', 'VarietyNames'],
      ['types', 'TypeNames'],
      ['packing', 'PackingTypeNames'],
    ] as const) {
      formData.getAll(from).forEach((v) => String(v).trim() && form.append(to, String(v).trim()));
    }
    numbers(formData, 'vitamins').forEach((n) => form.append('VitaminIds', String(n)));
    numbers(formData, 'minerals').forEach((n) => form.append('MineralIds', String(n)));
    numbers(formData, 'months').forEach((n) => form.append('HarvestMonthCodes', String(n)));

    await createItem('Product', form);
    refresh(['products'], ...productPaths());
  } catch (error) {
    return errorResult(error);
  }
  redirect('/admin/products?created=1');
}

export async function updateProduct(id: number, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await updateItem('Product', {
      id,
      name: text(formData, 'name'),
      nameLocalization: text(formData, 'nameLocalization'),
      description: text(formData, 'description'),
      descriptionLocalization: text(formData, 'descriptionLocalization'),
      productCategoryId: Number(formData.get('productCategoryId')),
    });
    refresh(['products'], ...productPaths(id));
    return success('saved');
  } catch (error) {
    return errorResult(error);
  }
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  try {
    await deleteItem('Product', id);
    refresh(['products'], ...productPaths());
    return success('deleted');
  } catch (error) {
    return errorResult(error);
  }
}

export async function setProductVisibility(id: number, visible: boolean): Promise<ActionResult> {
  try {
    await setProductHidden(id, !visible);
    refresh(['products'], ...productPaths(id), '/', '/products', '/sitemap.xml');
    revalidatePath('/products/[slug]', 'page');
    return success('saved');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
      console.error('[admin] visibility storage is read-only — connect Upstash Redis', error);
      return { ok: false, message: (await getDictionary()).products.storageMissing, at: Date.now() };
    }
    return errorResult(error);
  }
}

export async function uploadProductImages(productId: number, formData: FormData): Promise<ActionResult> {
  try {
    for (const file of files(formData, 'images')) {
      const form = new FormData();
      form.append('ProductId', String(productId));
      form.append('ImagePathFile', file);
      await createItem('ProductImage', form);
    }
    refresh(['products'], ...productPaths(productId));
    return success('saved');
  } catch (error) {
    return errorResult(error);
  }
}

export async function deleteProductImage(productId: number, imageId: number): Promise<ActionResult> {
  try {
    await deleteItem('ProductImage', imageId);
    refresh(['products'], ...productPaths(productId));
    return success('deleted');
  } catch (error) {
    return errorResult(error);
  }
}

export async function addVariety(productId: number, name: string): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, at: Date.now() };
  try {
    await createItem('ProductVariety', { name: name.trim(), nameLocalization: '', productId });
    refresh(['products'], ...productPaths(productId));
    return success('saved');
  } catch (error) {
    return errorResult(error);
  }
}

export async function removeVariety(productId: number, varietyId: number): Promise<ActionResult> {
  try {
    await deleteItem('ProductVariety', varietyId);
    refresh(['products'], ...productPaths(productId));
    return success('deleted');
  } catch (error) {
    return errorResult(error);
  }
}

const sameText = (a: unknown, b: string) => typeof a === 'string' && a.trim().toLowerCase() === b.trim().toLowerCase();

export async function addProductLink(
  kind: string,
  productId: number,
  choice: { lookupId?: number; newName?: string },
): Promise<ActionResult> {
  if (!isProductLinkKind(kind)) return { ok: false, at: Date.now() };
  const config = productLinks[kind];

  try {
    let lookupId = choice.lookupId;
    const newName = choice.newName?.trim();
    if (!lookupId && newName && config.creatable) {
      const existing = (await listAll(config.lookup)).find((row: Row) => sameText(row.name, newName));
      if (!existing) {
        await createItem(config.lookup, config.lookup === 'Type' ? { name: newName, nameLocalization: '', description: '', descriptionLocalization: '' } : { name: newName, nameLocalization: '' });
      }
      lookupId = existing?.id ?? (await listAll(config.lookup)).find((row: Row) => sameText(row.name, newName))?.id;
    }
    if (!lookupId) return { ok: false, message: (await getDictionary()).common.error, at: Date.now() };

    await createItem(config.link, { productId, [config.idKey]: lookupId });
    refresh(['products'], ...productPaths(productId));
    return success('saved');
  } catch (error) {
    return errorResult(error);
  }
}

export async function removeProductLink(kind: string, productId: number, linkId: number): Promise<ActionResult> {
  if (!isProductLinkKind(kind)) return { ok: false, at: Date.now() };
  try {
    await deleteItem(productLinks[kind].link, linkId);
    refresh(['products'], ...productPaths(productId));
    return success('deleted');
  } catch (error) {
    return errorResult(error);
  }
}

export async function toggleHarvestMonth(productId: number, code: number, linkId: number | null): Promise<ActionResult> {
  try {
    if (linkId) await deleteItem('ProductHarvestMonth', linkId);
    else await createItem('ProductHarvestMonth', { productId, monthStatusCode: code });
    refresh(['products'], ...productPaths(productId));
    return success('saved');
  } catch (error) {
    return errorResult(error);
  }
}

/* ---------- Messages ---------- */

export async function deleteMessage(id: number): Promise<ActionResult> {
  try {
    await deleteItem('ContactUs', id);
    refresh([], '/admin/messages', '/admin');
    return success('deleted');
  } catch (error) {
    return errorResult(error);
  }
}
