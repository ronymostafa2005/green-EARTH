import { redirect } from 'next/navigation';
import { API_BASE_URL, ApiError, type ApiResponse, type PaginatedList } from '@/lib/api';
import type { Row } from './resources';
import { getToken } from './session';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  json?: unknown;
  form?: FormData;
};

export async function adminRequest<T>(path: string, { method = 'GET', json, form }: RequestOptions = {}): Promise<T> {
  const token = await getToken();
  if (!token) redirect('/admin/login');

  const headers: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  let body: BodyInit | undefined;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/${path}`, { method, headers, body, cache: 'no-store' });
  if (res.status === 401) redirect('/admin/logout?expired=1');

  const data = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || data?.succeeded === false) {
    throw new ApiError(data?.message ?? `Request failed with status ${res.status}`, res.status, data?.errors ?? []);
  }
  return data?.data as T;
}

type ListFilters = Record<string, string | number | undefined>;

export function listPage<T = Row>(endpoint: string, filters: ListFilters & { pageNumber?: number; pageSize?: number } = {}) {
  return adminRequest<PaginatedList<T>>(`${endpoint}/GetPaginatedList`, {
    method: 'POST',
    json: { pageNumber: 1, pageSize: 20, search: '', ...filters },
  });
}

export async function listAll<T = Row>(endpoint: string, filters: ListFilters = {}) {
  const first = await listPage<T>(endpoint, { ...filters, pageNumber: 1, pageSize: 100 });
  const items = [...(first?.data ?? [])];
  for (let page = 2; page <= (first?.totalPages ?? 1); page++) {
    items.push(...((await listPage<T>(endpoint, { ...filters, pageNumber: page, pageSize: 100 }))?.data ?? []));
  }
  return items;
}

export async function countOf(endpoint: string) {
  const page = await listPage(endpoint, { pageNumber: 1, pageSize: 1 });
  return page?.totalCount ?? 0;
}

export function getById<T = Row>(endpoint: string, id: number) {
  return adminRequest<T>(`${endpoint}/GetById/${id}`);
}

export function createItem(endpoint: string, body: Record<string, unknown> | FormData) {
  return adminRequest<unknown>(`${endpoint}/Create`, body instanceof FormData ? { method: 'POST', form: body } : { method: 'POST', json: body });
}

export function updateItem(endpoint: string, body: Record<string, unknown> | FormData) {
  return adminRequest<unknown>(`${endpoint}/Update`, body instanceof FormData ? { method: 'PUT', form: body } : { method: 'PUT', json: body });
}

export function deleteItem(endpoint: string, id: number) {
  return adminRequest<unknown>(`${endpoint}/HardDelete/${id}`, { method: 'DELETE' });
}

/** Loads a list but returns null instead of failing the whole page. */
export async function tryListAll<T = Row>(endpoint: string, filters: ListFilters = {}) {
  try {
    return await listAll<T>(endpoint, filters);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`[admin] ${endpoint} list failed: ${error.message}`);
      return null;
    }
    throw error;
  }
}
