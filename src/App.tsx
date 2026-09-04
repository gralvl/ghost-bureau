import { useEffect, useMemo, useState } from 'react'
import { scenarios, type ScenarioKey } from './data'
import { validateAppData } from './validateData'
import type { AppState, GhostRequest } from './types'
import { matchPlacement } from './matchPlacement'
import { resolveOccupancy } from './occupancy'
import { Header } from './components/Header'
import { PlaceList } from './components/PlaceList'
import { RequestList } from './components/RequestList'
import { RequestCard } from './components/RequestCard'
import { Report } from './components/Report'
import { Section } from './components/ui'

type Tab = 'overview' | 'report'

export default function App() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('normal')
  const validation = useMemo(() => validateAppData(scenarios[scenarioKey].raw), [scenarioKey])

  const [state, setState] = useState<AppState | null>(validation.ok ? validation.data : null)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')

  // Пересобрать состояние при смене набора данных.
  useEffect(() => {
    setState(validation.ok ? validation.data : null)
    setSelectedRequestId(null)
  }, [validation])

  const scenarioBar = (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 bg-slate-950 px-6 py-2 text-xs">
      <span className="text-slate-500">демо-данные:</span>
      {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setScenarioKey(key)}
          className={`rounded px-2 py-1 ${
            key === scenarioKey
              ? 'bg-slate-700 text-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {scenarios[key].label}
        </button>
      ))}
    </div>
  )

  // Обязательное состояние: битые данные.
  if (!validation.ok) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {scenarioBar}
        <div className="mx-auto max-w-lg space-y-3 px-6 py-12">
          <h1 className="text-lg font-semibold text-red-200">Битые данные</h1>
          <p className="text-sm text-slate-400">
            Набор не прошёл проверку модели данных. Найдено ошибок: {validation.errors.length}.
            Приложение не запускается на таких данных.
          </p>
          <ul className="space-y-1 rounded-lg border border-red-800/60 bg-red-950/30 p-4 text-sm text-red-300">
            {validation.errors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (!state) return null

  const { currentDay, requests, places } = state

  const nextDay = () => setState((s) => (s ? { ...s, currentDay: s.currentDay + 1 } : s))

  const withPlacement = (r: GhostRequest, placeId: string): GhostRequest => ({
    ...r,
    assignedPlaceId: placeId,
    status: 'placed',
  })

  const withoutPlacement = (r: GhostRequest): GhostRequest => ({
    ...r,
    assignedPlaceId: undefined,
    status: 'pending',
  })

  const assignPlace = (requestId: string, placeId: string) => {
    setState((s) =>
      s
        ? { ...s, requests: s.requests.map((r) => (r.id === requestId ? withPlacement(r, placeId) : r)) }
        : s,
    )
  }

  const clearAssignment = (requestId: string) => {
    setState((s) => {
      if (!s) return s
      const cleared = s.requests.map((r) => (r.id === requestId ? withoutPlacement(r) : r))
      const resolved = resolveOccupancy(s.places, cleared, { excludeRequestId: requestId })
      return {
        ...s,
        requests: cleared.map((r) => {
          if (r.id !== requestId) return r
          const result = matchPlacement(r, resolved, s.currentDay)
          const status: GhostRequest['status'] =
            'unplaceable' in result ? 'unplaceable' : 'pending'
          return { ...r, status }
        }),
      }
    })
  }

  const selected = requests.find((r) => r.id === selectedRequestId) ?? null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header currentDay={currentDay} onNextDay={nextDay} />
      {scenarioBar}

      <nav className="flex gap-1 border-b border-slate-800 px-6">
        {(
          [
            ['overview', 'Обзор'],
            ['report', 'Итоговый отчёт'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              tab === key
                ? 'border-violet-500 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {tab === 'overview' ? (
          <div className="space-y-8">
            <Section title="Заявки" count={requests.length}>
              <RequestList
                requests={requests}
                places={places}
                currentDay={currentDay}
                onOpenDetails={setSelectedRequestId}
              />
            </Section>
            <Section title="Места" count={places.length}>
              <PlaceList places={places} requests={requests} />
            </Section>
          </div>
        ) : (
          <Report requests={requests} places={places} currentDay={currentDay} />
        )}
      </main>

      {selected && (
        <RequestCard
          request={selected}
          places={places}
          requests={requests}
          currentDay={currentDay}
          onAssign={(placeId) => assignPlace(selected.id, placeId)}
          onClear={() => clearAssignment(selected.id)}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  )
}
