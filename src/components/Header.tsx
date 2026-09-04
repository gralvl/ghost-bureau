// Экран 0 из SPEC: счётчик дня + «Следующий день →». Без автотаймера.
export function Header({
  currentDay,
  onNextDay,
}: {
  currentDay: number
  onNextDay: () => void
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4 backdrop-blur">
      <h1 className="text-lg font-semibold text-slate-100">Бюро переселения привидений</h1>
      <div className="flex items-center gap-4">
        <span className="tabular-nums text-slate-300">День {currentDay}</span>
        <button
          type="button"
          onClick={onNextDay}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
        >
          Следующий день →
        </button>
      </div>
    </header>
  )
}
