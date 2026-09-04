import type { GhostRequest, Place, RequestStatus } from './types'
import { matchPlacement, roomConflictReason } from './matchPlacement'
import { resolveOccupancy } from './occupancy'

// Единая точка правды для статуса заявки. Раньше эта логика была
// продублирована в RequestList/RequestCard/Report со слегка разным
// исключением заявки из подсчёта занятости — из-за чего пересчёт статуса
// после смены дня или чужого assign/clear задевал только одну заявку,
// а остальные показывали устаревший статус (см. code review).

export interface ResolvedStatus {
  status: RequestStatus
  /**
   * placed      → причина конфликта с текущим местом, если есть, иначе null
   *               (это предупреждение, не запрет — статус всё равно 'placed').
   *               Только реальное несовпадение атрибутов места (чердак,
   *               зеркала, люди, шум, свет, влажность, вместимость) —
   *               истёкший дедлайн не в счёт, он не атрибут места.
   * unplaceable → причина отказа (самый частый блокирующий фактор,
   *               здесь дедлайн учитывается — это жёсткий фильтр подбора)
   * pending     → всегда null
   */
  reason: string | null
}

/**
 * По текущему состоянию (эта заявка, все места, все заявки, игровой день)
 * вычисляет актуальные status и reason для одной заявки. Все места нужны
 * для расчёта занятости (assignedPlaceId других заявок), сама заявка
 * исключается из подсчёта занятости места, в котором она уже стоит.
 */
export function resolveRequestStatus(
  request: GhostRequest,
  places: Place[],
  requests: GhostRequest[],
  currentDay: number,
): ResolvedStatus {
  const resolvedPlaces = resolveOccupancy(places, requests, { excludeRequestId: request.id })

  if (request.assignedPlaceId) {
    const place = resolvedPlaces.find((p) => p.id === request.assignedPlaceId)
    // Место могло пропасть из данных — тогда конфликт проверить не по чему.
    // roomConflictReason, не hardFilterReason: дедлайн — не атрибут места,
    // его просрочка не должна выглядеть как конфликт с текущим размещением.
    const reason = place ? roomConflictReason(request, place) : null
    return { status: 'placed', reason }
  }

  const match = matchPlacement(request, resolvedPlaces, currentDay)
  return 'reason' in match
    ? { status: 'unplaceable', reason: match.reason }
    : { status: 'pending', reason: null }
}

/**
 * Пересчитывает status для ВСЕХ заявок, а не только затронутой одним
 * действием — вызывается после смены дня и после любого assign/clear,
 * потому что решение по одной заявке (например, освобождение места)
 * может изменить актуальный статус других.
 */
export function recomputeStatuses(
  requests: GhostRequest[],
  places: Place[],
  currentDay: number,
): GhostRequest[] {
  return requests.map((r) => {
    const { status } = resolveRequestStatus(r, places, requests, currentDay)
    return r.status === status ? r : { ...r, status }
  })
}
