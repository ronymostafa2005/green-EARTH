import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Products hidden from the public site. The API has no visibility flag, so the ids live in
 * Upstash Redis when it is connected (needed on Vercel) and in a local JSON file otherwise.
 */
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_KEY = 'dge:hidden-products';
const FILE = path.join(process.cwd(), 'data', 'product-visibility.json');

const toIds = (values: unknown[]) => new Set(values.map(Number).filter((id) => Number.isInteger(id)));

async function redis(command: string, init: RequestInit) {
  const res = await fetch(`${REDIS_URL}/${command}`, {
    ...init,
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const json = (await res.json().catch(() => null)) as { result?: unknown; error?: string } | null;
  if (!res.ok || json?.error) throw new Error(`Redis ${command.split('/')[0]} failed: ${json?.error ?? res.status}`);
  return json?.result;
}

async function readFileIds() {
  try {
    const parsed = JSON.parse(await readFile(FILE, 'utf8')) as { hiddenProductIds?: unknown[] };
    return toIds(parsed.hiddenProductIds ?? []);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error('[visibility] could not read file', error);
    return new Set<number>();
  }
}

export async function getHiddenProductIds(): Promise<Set<number>> {
  if (!REDIS_URL || !REDIS_TOKEN) return readFileIds();
  try {
    const result = await redis(`smembers/${REDIS_KEY}`, { next: { revalidate: 300, tags: ['products'] } });
    return toIds(Array.isArray(result) ? result : []);
  } catch (error) {
    console.error('[visibility]', error);
    return new Set();
  }
}

export async function setProductHidden(id: number, hidden: boolean) {
  if (REDIS_URL && REDIS_TOKEN) {
    await redis(`${hidden ? 'sadd' : 'srem'}/${REDIS_KEY}/${id}`, { method: 'POST', cache: 'no-store' });
    return;
  }

  const ids = await readFileIds();
  if (hidden) ids.add(id);
  else ids.delete(id);
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify({ hiddenProductIds: [...ids].sort((a, b) => a - b) }, null, 2));
  await rename(temp, FILE);
}
