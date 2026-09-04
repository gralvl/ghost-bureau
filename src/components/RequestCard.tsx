import { useEffect, useState } from 'react'
import type { GhostRequest, Place, RequestStatus } from '../types'
import { conditionLabel, requestStatusLabel, temperatureLabel } from '../labels'
import { hardFilterReason, matchPlacement } from '../matchPlacement'
import { resolveOccupancy } from '../occupancy'
import { Badge, type Tone } from './ui'

// Экран 3 из SPEC: карточка заявки.
// Предложенное место + объяснение (из matchPlacement) и ручное переназначение
// с live-предупреждением, когда выбранное место конфликтует с условиями.
// Конфликт — предупреждение, а не запрет: разместить всё равно можно.

const statusTone: Record<RequestStatus, Tone> = {
  pending: 'blue',
  placed: 'green',
  unplaceable: 'red',
}

export function RequestCard({
  request,
  places,
  requests,
  currentDay,
  onAssign,
  onClear,
  onClose,
}: {
  request: GhostRequest
  places: Place[]
  requests: GhostRequest[]
  currentDay: number
  onAssign: (placeId: string) => void
  onClear: () => void
  onClose: () => void
}) {
  // Занятость мест с учётом ручных назначений, но без самой этой заявки —
  // решаем, куда её поставить, поэтому её слот не учитываем.
  const resolvedPlaces = resolveOccupancy(places, requests, { excludeRequestId: request.id })

  const match = matchPlacement(request, resolvedPlaces, currentDay)
  const suggestedId = 'placeId' in match ? match.placeId : null

  const [picked, setPicked] = useState<string>(request.assignedPlaceId ?? suggestedId ?? '')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Пересчитывается на каждый рендер → предупреждение обновляется вживую
  // при смене значения в списке.
  const pickedPlace = resolvedPlaces.find((p) => p.id === picked) ?? null
  const conflict = pickedPlace ? hardFilterReason(request, pickedPlace, currentDay) : null

  const assignedPlace = resolvedPlaces.find((p) => p.id === request.assignedPlaceId) ?? null
  const assignedConflict = assignedPlace
    ? hardFilterReason(request, assignedPlace, currentDay)
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Заявка: ${request.name}`}
        className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">{request.name}</h3>
            <Badge tone={statusTone[request.status]}>{requestStatusLabel[request.status]}</Badge>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>тревожность {request.anxietyLevel}/5</span>
          <span>температура: {temperatureLabel[request.favoriteTemperature]}</span>
          <span>дедлайн: день {request.deadline}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {request.specialConditions.length === 0 ? (
            <span className="text-xs text-slate-600">особых условий нет</span>
          ) : (
            request.specialConditions.map((c) => (
              <Badge key={c} tone="violet">
                {conditionLabel[c]}
              </Badge>
            ))
          )}
        </div>

        {/* Предложение бюро */}
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Предложение бюро
          </div>
          {'placeId' in match ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-slate-100">
                  {resolvedPlaces.find((p) => p.id === match.placeId)?.name}
                </span>
                <span className="tabular-nums text-sm text-slate-400">score {match.score}</span>
              </div>
              <ul className="list-inside list-disc text-sm text-slate-300">
                {match.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onAssign(match.placeId)}
                className="mt-1 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
              >
                Разместить здесь
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-red-300">Подходящего места нет: {match.reason}</p>
          )}
        </div>

        {/* Ручной выбор */}
        <div className="mt-4 space-y-2">
          <label
            htmlFor="manual-place"
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Ручной выбор места
          </label>
          <select
            id="manual-place"
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          >
            <option value="">— не выбрано —</option>
            {resolvedPlaces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — занято {p.currentOccupants}/{p.capacity}
              </option>
            ))}
          </select>

          {conflict && (
            <div className="rounded-md border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-300">
              ⚠ Конфликт с условиями заявки: <span className="font-medium">{conflict}</span>.
              <br />
              Разместить всё равно можно — это предупреждение, не запрет.
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={!picked || picked === request.assignedPlaceId}
              onClick={() => picked && onAssign(picked)}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Применить выбор
            </button>
            {request.assignedPlaceId && (
              <button
                type="button"
                onClick={onClear}
                className="rounded-md px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                Снять размещение
              </button>
            )}
          </div>

          {request.assignedPlaceId && (
            <p className="text-xs text-slate-500">
              Сейчас размещено: {assignedPlace?.name}
              {assignedConflict && (
                <span className="text-amber-400"> · конфликт: {assignedConflict}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
