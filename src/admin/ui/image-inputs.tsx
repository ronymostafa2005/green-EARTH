'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminIcon } from './icon';
import { useAdmin } from './provider';

function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  return urls;
}

const dropZone =
  'group relative grid cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 text-center transition hover:border-brand-400 hover:bg-brand-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-500/60 dark:hover:bg-brand-500/5';

/** Single image picker that submits its file under `name`. */
export function ImageInput({ name, currentUrl, label }: { name: string; currentUrl?: string | null; label: string }) {
  const { t } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [preview] = useObjectUrls(files);
  const shown = preview ?? currentUrl ?? null;

  function pick(list: FileList | null) {
    const file = list?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (inputRef.current) inputRef.current.files = transfer.files;
    setFiles([file]);
  }

  return (
    <div className="grid gap-1.5">
      <span className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{label}</span>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        className={cn(dropZone, 'aspect-[16/9]', dragging && 'border-brand-500 bg-brand-50 dark:bg-brand-500/10')}
      >
        <input ref={inputRef} type="file" name={name} accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files)} />
        {shown ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown} alt="" className="absolute inset-0 size-full object-contain p-4" />
            <span className="absolute inset-x-3 bottom-3 rounded-xl bg-stone-950/70 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              {t.fields.replaceImage}
            </span>
          </>
        ) : (
          <span className="grid justify-items-center gap-2 p-6 text-sm text-stone-500 dark:text-stone-400">
            <AdminIcon name="upload" size={22} className="text-brand-600 dark:text-brand-400" />
            {t.fields.uploadHint}
          </span>
        )}
      </label>
    </div>
  );
}

/** Multiple image picker; keeps its own list so files can be removed before upload. */
export function MultiImageInput({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const { t } = useAdmin();
  const [dragging, setDragging] = useState(false);
  const urls = useObjectUrls(files);

  function add(list: FileList | null) {
    const picked = Array.from(list ?? []).filter((file) => file.type.startsWith('image/'));
    if (picked.length) onChange([...files, ...picked]);
  }

  return (
    <div className="grid gap-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={cn(dropZone, 'py-8', dragging && 'border-brand-500 bg-brand-50 dark:bg-brand-500/10')}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = '';
          }}
        />
        <span className="grid justify-items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <AdminIcon name="upload" size={22} className="text-brand-600 dark:text-brand-400" />
          {t.fields.uploadMany}
        </span>
      </label>

      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200 dark:bg-white/5 dark:ring-white/10">
              {urls[i] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls[i]} alt="" className="size-full object-contain p-2" />
              )}
              {i === 0 && (
                <span className="absolute start-1.5 top-1.5 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">1</span>
              )}
              <button
                type="button"
                onClick={() => onChange(files.filter((_, index) => index !== i))}
                aria-label={t.fields.removeImage}
                className="absolute end-1.5 top-1.5 grid size-7 place-items-center rounded-lg bg-stone-950/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
              >
                <AdminIcon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
