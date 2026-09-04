import type { GhostRequest, Place, RequestStatus } from '../types'
import { conditionLabel, requestStatusLabel, temperatureLabel } from '../labels'
import { Badge, EmptyState, type Tone } from './ui'

// Экран 1 из SPEC: список заявок. Статус — цветом, условия — бейджами,
// кнопка «детали». Бизнес-логика не вызывается: статус берётся как есть.

const statusTone: Record<RequestStatus, Tone> = {
  pending: 'blue',
  placed: 'green',
  unplaceable: 'red',
}

export function RequestList({
  requests,
  places,
  onOpenDetails,
}: {
  requests: GhostRequest[]
  places: Place[]
  onOpenDetails: (requestId: string) => void
}) {
  if (requests.length === 0) {
    return <EmptyState>Заявок нет</EmptyState>
  }

  const placeName = (id: string | undefined): string | undefined =>
    places.find((p) => p.id === id)?.name

  return (
    <ul className="space-y-2">
      {requests.map((r) => (
        <li key={r.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-100">{r.name}</span>
                <Badge tone={statusTone[r.status]}>{requestStatusLabel[r.status]}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span>тревожность {r.anxietyLevel}/5</span>
                <span>температура: {temperatureLabel[r.favoriteTemperature]}</span>
                <span>дедлайн: день {r.deadline}</span>
                {r.status === 'placed' && placeName(r.assignedPlaceId) && (
                  <span className="text-green-400">→ {placeName(r.assignedPlaceId)}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {r.specialConditions.length === 0 ? (
                  <span className="text-xs text-slate-600">особых условий нет</span>
                ) : (
                  r.specialConditions.map((c) => (
                    <Badge key={c} tone="violet">
                      {conditionLabel[c]}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDetails(r.id)}
              className="shrink-0 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              детали
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
