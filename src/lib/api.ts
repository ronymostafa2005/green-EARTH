// true: use the local mock data in src/data. false: use the backend API.
export const USE_MOCK_DATA = false;

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'https://clinicaipoweredsystem.runasp.net'
).replace(/\/+$/, '');

const REVALIDATE_SECONDS = 300;

export type ApiResponse<T> = {
  statusCode: number;
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  data: T;
};

export type PaginatedList<T> = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: T[];
};

export type PaginatedListRequest = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
};

export type ApiCertification = {
  id: number;
  name: string;
  nameLocalization: string | null;
  certificationUrl: string | null;
  description: string | null;
  descriptionLocalization: string | null;
};

export type ApiExhibition = {
  id: number;
  name: string;
  nameLocalization: string | null;
  exhibitionUrl: string | null;
  description: string | null;
  descriptionLocalization: string | null;
  location: string | null;
  year: string | null;
};

export type ApiProduct = {
  id: number;
  name: string;
  nameLocalization: string | null;
  description: string | null;
  descriptionLocalization: string | null;
  productCategoryId: number;
  productCategoryName: string | null;
};

export type ApiProductImage = {
  id: number;
  productId: number;
  imagePath: string | null;
};

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init?.headers },
  });

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !json?.succeeded) {
    throw new ApiError(json?.message ?? `Request failed with status ${res.status}`, res.status, json?.errors ?? []);
  }

  return json.data;
}

function apiPost<T>(path: string, body: unknown, init?: RequestInit) {
  return apiRequest<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) });
}

async function getAllPages<T>(fetchPage: (pageNumber: number) => Promise<PaginatedList<T>>) {
  const first = await fetchPage(1);
  const items = [...first.data];
  for (let page = 2; page <= first.totalPages; page++) {
    items.push(...(await fetchPage(page)).data);
  }
  return items;
}

export function apiAssetUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}

export function getCertifications({ pageNumber = 1, pageSize = 50, search = '' }: PaginatedListRequest = {}) {
  return apiPost<PaginatedList<ApiCertification>>(
    '/api/v1/Certification/GetPaginatedList',
    { pageNumber, pageSize, search },
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['certifications'] } },
  );
}

export function getExhibitions({ pageNumber = 1, pageSize = 50, search = '' }: PaginatedListRequest = {}) {
  return apiPost<PaginatedList<ApiExhibition>>(
    '/api/v1/Exhibition/GetPaginatedList',
    { pageNumber, pageSize, search },
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['exhibitions'] } },
  );
}

export function getProducts({
  pageNumber = 1,
  pageSize = 50,
  search = '',
  productCategoryId,
}: PaginatedListRequest & { productCategoryId?: number } = {}) {
  return apiPost<PaginatedList<ApiProduct>>(
    '/api/v1/Product/GetPaginatedList',
    { pageNumber, pageSize, search, productCategoryId },
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['products'] } },
  );
}

export function getAllProducts() {
  return getAllPages((pageNumber) => getProducts({ pageNumber, pageSize: 100 }));
}

export function getProductById(id: number) {
  return apiRequest<ApiProduct>(`/api/v1/Product/GetById/${id}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ['products', `product-${id}`] },
  });
}

export function getProductImages({ pageNumber = 1, pageSize = 50, productId }: PaginatedListRequest & { productId?: number } = {}) {
  return apiPost<PaginatedList<ApiProductImage>>(
    '/api/v1/ProductImage/GetPaginatedList',
    { pageNumber, pageSize, productId },
    { next: { revalidate: REVALIDATE_SECONDS, tags: ['product-images'] } },
  );
}

export function getAllProductImages() {
  return getAllPages((pageNumber) => getProductImages({ pageNumber, pageSize: 200 }));
}

export async function createContactMessage(message: ContactMessage) {
  if (USE_MOCK_DATA) return null;
  return apiPost<unknown>('/api/v1/ContactUs/Create', message, { cache: 'no-store' });
}
