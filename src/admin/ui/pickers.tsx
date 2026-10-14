'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { inputStyles } from './controls';
import { AdminIcon } from './icon';
import { useAdmin } from './provider';

export const chipStyles =
  'inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 ps-3 pe-1.5 text-[13px] font-medium text-brand-800 ring-1 ring-brand-200/70 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/20';

/** Free-text tags submitted as repeated hidden inputs named `name`. */
export function TagInput({ name, values, onChange, suggestions = [] }: { name: string; values: string[]; onChange: (v: string[]) => void; suggestions?: string[] }) {
  const { t } = useAdmin();
  const [draft, setDraft] = useState('');
  const listId = `${name}-suggestions`;

  function commit() {
    const value = draft.trim();
    if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setDraft('');
  }

  return (
    <div className="grid gap-2.5">
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li key={value} className={chipStyles}>
              {value}
              <input type="hidden" name={name} value={value} />
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== value))}
                aria-label={`${t.common.delete} ${value}`}
                className="grid size-5 place-items-center rounded-full hover:bg-brand-200/60 dark:hover:bg-brand-500/20"
              >
                <AdminIcon name="x" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        value={draft}
        list={suggestions.length ? listId : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={t.products.addPlaceholder}
        className={inputStyles}
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}

/** Toggleable chips for picking ids; submitted as hidden inputs named `name`. */
export function ChipSelect({ name, options, selected, onChange }: { name: string; options: { id: number; label: string }[]; selected: number[]; onChange: (ids: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? selected.filter((id) => id !== option.id) : [...selected, option.id])}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium ring-1 transition',
              active
                ? 'bg-brand-600 text-white ring-brand-600 dark:bg-brand-500 dark:text-brand-950 dark:ring-brand-500'
                : 'bg-white text-stone-600 ring-stone-200 hover:ring-stone-300 dark:bg-white/5 dark:text-stone-300 dark:ring-white/10',
            )}
          >
            {active && <AdminIcon name="check" size={14} />}
            {option.label}
          </button>
        );
      })}
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}

export function MonthPicker({ selected, onToggle, name, disabled }: { selected: number[]; onToggle: (code: number) => void; name?: string; disabled?: boolean }) {
  const { t } = useAdmin();
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {t.months.map((month, i) => {
        const code = i + 1;
        const active = selected.includes(code);
        return (
          <button
            key={month}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onToggle(code)}
            className={cn(
              'rounded-xl px-2 py-2.5 text-[13px] font-semibold ring-1 transition disabled:opacity-60',
              active
                ? 'bg-brand-600 text-white ring-brand-600 dark:bg-brand-500 dark:text-brand-950 dark:ring-brand-500'
                : 'bg-white text-stone-500 ring-stone-200 hover:text-stone-800 dark:bg-white/5 dark:text-stone-400 dark:ring-white/10 dark:hover:text-stone-100',
            )}
          >
            {month}
            {name && active && <input type="hidden" name={name} value={code} />}
          </button>
        );
      })}
    </div>
  );
}
