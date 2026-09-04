import type { ReactNode } from 'react'
import type { GhostRequest, Place } from '../types'
import { conditionLabel, requestStatusLabel } from '../labels'
import { hardFilterReason, matchPlacement } from '../matchPlacement'
import { placeLoad, resolveOccupancy } from '../occupancy'
import { Badge } from './ui'

// Экран 4 из SPEC: итоговый отчёт —
// расселено / без места / проблемные заявки / перегруженные места.

interface Problem {
  request: GhostRequest
  tags: string[]
}

function Tile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <div className={`text-2xl font-semibold tabular-nums ${tone}`}>{value}</div>
      <div className="mt-0.5 text-xs text-slate-400">{label}</div>
    </div>
  )
}

function Group({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-baseline gap-2 text-sm font-semibold text-slate-200">
        {title}
        <span className="tabular-nums text-slate-500">{count}</span>
      </h3>
      {count === 0 ? <p className="text-xs text-slate-600">— пусто</p> : children}
    </div>
  )
}

export function Report({
  requests,
  places,
  currentDay,
}: {
  requests: GhostRequest[]
  places: Place[]
  currentDay: number
}) {
  const placeById = (id: string | undefined): Place | null =>
    places.find((p) => p.id === id) ?? null

  const placed = requests.filter((r) => r.status === 'placed')
  const unplaceable = requests.filter((r) => r.status === 'unplaceable')

  const reasonFor = (r: GhostRequest): string | null => {
    const resolved = resolveOccupancy(places, requests, { excludeRequestId: r.id })
    const m = matchPlacement(r, resolved, currentDay)
    return 'reason' in m ? m.reason : null
  }

  const conflictFor = (r: GhostRequest): string | null => {
    const place = placeById(r.assignedPlaceId)
    if (!place) return null
    const [resolved] = resolveOccupancy([place], requests, { excludeRequestId: r.id })
    return hardFilterReason(r, resolved, currentDay)
  }

  // Проблемные заявки: одна строка на заявку, теги проблем накапливаются.
  // Плановое ожидание (pending с запасом по времени) проблемой не считаем.
  const problems = new Map<string, Problem>()
  const flag = (r: GhostRequest, tag: string) => {
    const entry: Problem = problems.get(r.id) ?? { request: r, tags: [] }
    entry.tags.push(tag)
    problems.set(r.id, entry)
  }
  for (const r of requests) {
    if (r.deadline < currentDay) flag(r, 'дедлайн просрочен')
    else if (r.status === 'pending' && r.deadline - currentDay <= 1) flag(r, 'дедлайн на носу')
  }
  for (const r of placed) {
    const c = conflictFor(r)
    if (c) flag(r, `размещено с конфликтом: ${c}`)
  }
  const problemList = [...problems.values()]

  const overloaded = places
    .map((place) => ({ place, load: placeLoad(place, requests) }))
    .filter((x) => x.load.overCapacity)

  return (
    <div className="space-y-6">
      {requests.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-800 px-4 py-6 text-center text-sm text-slate-500">
          Заявок нет — расселять некого. Ниже только состояние мест.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label={`расселено из ${requests.length}`} value={placed.length} tone="text-green-300" />
        <Tile
          label="без места"
          value={unplaceable.length}
          tone={unplaceable.length ? 'text-red-300' : 'text-slate-100'}
        />
        <Tile
          label="проблемных заявок"
          value={problemList.length}
          tone={problemList.length ? 'text-amber-300' : 'text-slate-100'}
        />
        <Tile
          label="перегружено мест"
          value={overloaded.length}
          tone={overloaded.length ? 'text-red-300' : 'text-slate-100'}
        />
      </div>

      <Group title="Расселено" count={placed.length}>
        <ul className="space-y-1 text-sm">
          {placed.map((r) => {
            const conflict = conflictFor(r)
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-2 text-slate-300">
                <span className="text-slate-100">{r.name}</span>
                <span className="text-slate-500">
                  → {placeById(r.assignedPlaceId)?.name ?? 'неизвестное место'}
                </span>
                {conflict && <Badge tone="amber">⚠ {conflict}</Badge>}
              </li>
            )
          })}
        </ul>
      </Group>

      <Group title="Без места" count={unplaceable.length}>
        <ul className="space-y-1 text-sm">
          {unplaceable.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2">
              <span className="text-slate-100">{r.name}</span>
              <span className="text-red-300">{reasonFor(r) ?? 'причина не установлена'}</span>
              {r.specialConditions.map((c) => (
                <Badge key={c} tone="violet">
                  {conditionLabel[c]}
                </Badge>
              ))}
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Проблемные заявки" count={problemList.length}>
        <ul className="space-y-1 text-sm">
          {problemList.map(({ request, tags }) => (
            <li key={request.id} className="flex flex-wrap items-center gap-2">
              <span className="text-slate-100">{request.name}</span>
              <span className="text-xs text-slate-500">{requestStatusLabel[request.status]}</span>
              {tags.map((t) => (
                <Badge key={t} tone="amber">
                  {t}
                </Badge>
              ))}
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Перегруженные места" count={overloaded.length}>
        <ul className="space-y-1 text-sm">
          {overloaded.map(({ place, load }) => (
            <li key={place.id} className="flex flex-wrap items-center gap-2">
              <span className="text-slate-100">{place.name}</span>
              <span className="tabular-nums text-red-300">
                занято {load.total} / {place.capacity}
              </span>
              <span className="text-xs text-slate-500">
                +{load.total - place.capacity} сверх нормы · {load.base} из моков + {load.placed} по
                заявкам
              </span>
            </li>
          ))}
        </ul>
      </Group>
    </div>
  )
}
