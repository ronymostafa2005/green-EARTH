import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Products hidden from the public site. Kept on the Next.js server because the
 * API has no visibility flag yet — needs a persistent filesystem (not Vercel).
 */
const FILE = path.join(process.cwd(), 'data', 'product-visibility.json');

type VisibilityFile = { hiddenProductIds: number[] };

export async function getHiddenProductIds(): Promise<Set<number>> {
  try {
    const parsed = JSON.parse(await readFile(FILE, 'utf8')) as Partial<VisibilityFile>;
    return new Set((parsed.hiddenProductIds ?? []).filter((id) => Number.isInteger(id)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error('[visibility] could not read file', error);
    return new Set();
  }
}

export async function setProductHidden(id: number, hidden: boolean) {
  const ids = await getHiddenProductIds();
  if (hidden) ids.add(id);
  else ids.delete(id);

  const data: VisibilityFile = { hiddenProductIds: [...ids].sort((a, b) => a - b) };
  await mkdir(path.dirname(FILE), { recursive: true });
  const temp = `${FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2));
  await rename(temp, FILE);
}
