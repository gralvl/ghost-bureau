// Экран 5 из SPEC: AI Worklog — отдельная вкладка, пустой оформленный
// контейнер с секциями-заголовками. Контент вставляется вручную позже,
// здесь нет ни данных, ни логики.

const SECTIONS = [
  { title: 'Инструменты', hint: 'Какие AI-инструменты использовались и для чего.' },
  { title: 'Хронология', hint: 'Ключевые этапы разработки по времени.' },
  { title: 'Промпты и решения', hint: 'Значимые промпты и принятые по ходу решения.' },
  { title: 'Ошибки AI и доработки', hint: 'Что AI сделал не так и как это поправили.' },
] as const

export function Worklog() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Черновик процесса разработки — контент каждой секции добавляется вручную.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <section
            key={s.title}
            className="rounded-lg border border-dashed border-slate-800 bg-slate-900/40 p-4"
          >
            <h3 className="text-sm font-semibold text-slate-200">{s.title}</h3>
            <p className="mt-1 text-xs text-slate-600">{s.hint}</p>
            <div className="mt-3 rounded-md border border-slate-800/60 bg-slate-950/40 px-3 py-6 text-center text-xs text-slate-600">
              — пусто —
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
