import { useState } from 'react'
import { initialState } from './data'
import { Header } from './components/Header'
import { PlaceList } from './components/PlaceList'
import { RequestList } from './components/RequestList'
import { Section } from './components/ui'

export default function App() {
  const [state, setState] = useState(initialState)
  // Задел под экран 3 (карточка заявки): кнопка «детали» уже передаёт сюда id.
  const [, setSelectedRequestId] = useState<string | null>(null)
  const { currentDay, requests, places } = state

  const nextDay = () => setState((s) => ({ ...s, currentDay: s.currentDay + 1 }))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header currentDay={currentDay} onNextDay={nextDay} />
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <Section title="Заявки" count={requests.length}>
          <RequestList
            requests={requests}
            places={places}
            onOpenDetails={setSelectedRequestId}
          />
        </Section>
        <Section title="Места" count={places.length}>
          <PlaceList places={places} />
        </Section>
      </main>
    </div>
  )
}
