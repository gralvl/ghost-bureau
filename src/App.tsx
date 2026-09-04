import { useState } from 'react'
import { initialState } from './data'

/**
 * Каркас. Экраны 0–5 из SPEC ещё не реализованы — здесь только проверка,
 * что стек собран, Tailwind работает и мок-данные подхватываются.
 */
export default function App() {
  const [state, setState] = useState(initialState)
  const { currentDay, requests, places } = state

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold">Бюро переселения привидений</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">День {currentDay}</span>
          <button
            className="rounded bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
            onClick={() => setState((s) => ({ ...s, currentDay: s.currentDay + 1 }))}
          >
            Следующий день →
          </button>
        </div>
      </header>

      <main className="px-6 py-6 text-sm text-slate-400">
        Каркас проекта готов. Заявок: {requests.length}. Мест: {places.length}.
        Экраны и формула подбора — следующие шаги по SPEC.md.
      </main>
    </div>
  )
}
