import type { GhostRequest, Place } from '../types'
import {
  architecturalStyleLabel,
  humidityScale,
  lightingScale,
  noiseScale,
  propertyTypeLabel,
  restrictionLabel,
  scaleWord,
} from '../labels'
import { placeLoad, type PlaceLoad } from '../occupancy'
import { Badge, EmptyState, Meter, type Tone } from './ui'

// Экран 2 из SPEC: список мест. Вместимость (занято/всего) считается с учётом
// текущих ручных назначений (assignedPlaceId), а не только моковых
// currentOccupants. Статус выводится из заполненности.

function occupancyStatus(load: PlaceLoad): { label: string; tone: Tone } {
  if (load.overCapacity) return { label: 'переполнено', tone: 'red' }
  if (load.free === 0) return { label: 'мест нет', tone: 'red' }
  if (load.free === 1) return { label: 'почти заполнено', tone: 'amber' }
  return { label: 'есть места', tone: 'green' }
}

export function PlaceList({
  places,
  requests,
}: {
  places: Place[]
  requests: GhostRequest[]
}) {
  if (places.length === 0) {
    return <EmptyState>Мест нет</EmptyState>
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {places.map((p) => {
        const load = placeLoad(p, requests)
        const status = occupancyStatus(load)
        const fillPercent = p.capacity > 0 ? Math.min(100, (load.total / p.capacity) * 100) : 100

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
                  {load.total} / {p.capacity}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${load.overCapacity ? 'bg-red-500' : 'bg-slate-400'}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              {load.placed > 0 && (
                <div className="mt-1 text-[11px] text-slate-500">
                  {load.base} из моков + {load.placed} по заявкам
                </div>
              )}
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
