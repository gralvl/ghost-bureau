import type { ReactNode } from 'react'

// Мелкие презентационные примитивы, общие для экранов списков.

export type Tone = 'slate' | 'green' | 'red' | 'amber' | 'blue' | 'violet'

const toneClass: Record<Tone, string> = {
  slate: 'bg-slate-800 text-slate-300 ring-slate-700',
  green: 'bg-green-900/50 text-green-300 ring-green-700/60',
  red: 'bg-red-900/50 text-red-300 ring-red-700/60',
  amber: 'bg-amber-900/50 text-amber-300 ring-amber-700/60',
  blue: 'bg-blue-900/50 text-blue-300 ring-blue-700/60',
  violet: 'bg-violet-900/50 text-violet-300 ring-violet-700/60',
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClass[tone]}`}
    >
      {children}
    </span>
  )
}

/** Дискретный индикатор 1–5 из пяти сегментов. */
export function Meter({ value, label }: { value: number; label: string }) {
  const filled = Math.min(Math.max(value, 1), 5)
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs leading-tight text-slate-400">{label}</span>
      <div className="flex gap-0.5" aria-label={`${label}: ${filled} из 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`h-1.5 w-full rounded-sm ${n <= filled ? 'bg-slate-300' : 'bg-slate-700'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
        {count !== undefined && <span className="tabular-nums text-slate-600">{count}</span>}
      </h2>
      {children}
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </p>
  )
}
