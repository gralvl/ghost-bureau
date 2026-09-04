import type { Place } from '../types'
import {
  architecturalStyleLabel,
  humidityScale,
  lightingScale,
  noiseScale,
  propertyTypeLabel,
  restrictionLabel,
  scaleWord,
} from '../labels'
import { Badge, EmptyState, Meter, type Tone } from './ui'

// Экран 2 из SPEC: список мест. Вместимость (занято/всего), параметры, статус.
// Статус выводится из заполненности — отдельного поля в модели нет.

function occupancyStatus(place: Place): { label: string; tone: Tone } {
  const free = place.capacity - place.currentOccupants
  if (free < 0) return { label: 'переполнено', tone: 'red' }
  if (free === 0) return { label: 'мест нет', tone: 'red' }
  if (free === 1) return { label: 'почти заполнено', tone: 'amber' }
  return { label: 'есть места', tone: 'green' }
}

export function PlaceList({ places }: { places: Place[] }) {
  if (places.length === 0) {
    return <EmptyState>Мест нет</EmptyState>
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {places.map((p) => {
        const status = occupancyStatus(p)
        const overfilled = p.currentOccupants > p.capacity
        const fillPercent = Math.min(100, (p.currentOccupants / p.capacity) * 100)

        return (
          <li
            key={p.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-slate-100">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {propertyTypeLabel[p.propertyType]} · {architecturalStyleLabel[p.architecturalStyle]}{' '}
                  · {p.price}₽
                </div>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>

            <div>
              <div className="flex items-baseline justify-between text-xs text-slate-400">
                <span>занято</span>
                <span className="tabular-nums text-slate-300">
                  {p.currentOccupants} / {p.capacity}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${overfilled ? 'bg-red-500' : 'bg-slate-400'}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Meter label={`свет · ${scaleWord(lightingScale, p.lighting)}`} value={p.lighting} />
              <Meter
                label={`влажность · ${scaleWord(humidityScale, p.humidity)}`}
                value={p.humidity}
              />
              <Meter label={`шум · ${scaleWord(noiseScale, p.noiseLevel)}`} value={p.noiseLevel} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge tone={p.hasHumans ? 'amber' : 'slate'}>
                {p.hasHumans ? 'есть люди' : 'без людей'}
              </Badge>
              {p.restrictions.map((r) => (
                <Badge key={r} tone="slate">
                  {restrictionLabel[r]}
                </Badge>
              ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
