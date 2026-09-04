import { useState } from 'react'
import { initialState } from './data'
import { Header } from './components/Header'
import { PlaceList } from './components/PlaceList'
import { RequestList } from './components/RequestList'
import { RequestCard } from './components/RequestCard'
import { Section } from './components/ui'
import { matchPlacement } from './matchPlacement'
import type { GhostRequest } from './types'

export default function App() {
  const [state, setState] = useState(initialState)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const { currentDay, requests, places } = state

  const nextDay = () => setState((s) => ({ ...s, currentDay: s.currentDay + 1 }))

  const assignPlace = (requestId: string, placeId: string) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map(
        (r): GhostRequest =>
          r.id === requestId ? { ...r, assignedPlaceId: placeId, status: 'placed' } : r,
      ),
    }))
  }

  const clearAssignment = (requestId: string) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r): GhostRequest => {
        if (r.id !== requestId) return r
        const probe: GhostRequest = { ...r, assignedPlaceId: undefined }
        const result = matchPlacement(probe, s.places, s.currentDay)
        return { ...probe, status: 'unplaceable' in result ? 'unplaceable' : 'pending' }
      }),
    }))
  }

  const selected = requests.find((r) => r.id === selectedRequestId) ?? null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header currentDay={currentDay} onNextDay={nextDay} />
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <Section title="Заявки" count={requests.length}>
          <RequestList
            requests={requests}
            places={places}
            currentDay={currentDay}
            onOpenDetails={setSelectedRequestId}
          />
        </Section>
        <Section title="Места" count={places.length}>
          <PlaceList places={places} />
        </Section>
      </main>

      {selected && (
        <RequestCard
          request={selected}
          places={places}
          currentDay={currentDay}
          onAssign={(placeId) => assignPlace(selected.id, placeId)}
          onClear={() => clearAssignment(selected.id)}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  )
}
