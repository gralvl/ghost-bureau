import type { GhostRequest, Place } from './types'

// Фактическая занятость места = базовые постояльцы из моков (currentOccupants)
// + заявки со статусом 'placed', назначенные на это место вручную/автоматически.
// Базовый currentOccupants трактуется как «прочие обитатели», не описанные
// заявками, поэтому размещённые заявки добавляются сверху.

export interface PlaceLoad {
  /** из моков (Place.currentOccupants) */
  base: number
  /** размещённых заявок на этом месте */
  placed: number
  /** base + placed */
  total: number
  /** capacity - total (может быть отрицательным) */
  free: number
  overCapacity: boolean
}

export function placeLoad(
  place: Place,
  requests: GhostRequest[],
  opts: { excludeRequestId?: string } = {},
): PlaceLoad {
  const placed = requests.filter(
    (r) =>
      r.status === 'placed' &&
      r.assignedPlaceId === place.id &&
      r.id !== opts.excludeRequestId,
  ).length

  const total = place.currentOccupants + placed
  return {
    base: place.currentOccupants,
    placed,
    total,
    free: place.capacity - total,
    overCapacity: total > place.capacity,
  }
}

/**
 * Копии мест, у которых currentOccupants заменён на фактическую загрузку.
 * Нужны, чтобы matchPlacement видел занятость с учётом ручных назначений.
 * excludeRequestId — не считать саму заявку, для которой идёт подбор.
 */
export function resolveOccupancy(
  places: Place[],
  requests: GhostRequest[],
  opts: { excludeRequestId?: string } = {},
): Place[] {
  return places.map((place) => ({
    ...place,
    currentOccupants: placeLoad(place, requests, opts).total,
  }))
}
