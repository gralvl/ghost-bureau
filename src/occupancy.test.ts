import { describe, expect, it } from 'vitest'
import { placeLoad, resolveOccupancy } from './occupancy'
import type { GhostRequest, Place } from './types'

const place = (over: Partial<Place> = {}): Place => ({
  id: 'p',
  name: 'Место',
  propertyType: 'castle',
  price: 0,
  architecturalStyle: 'gothic',
  capacity: 3,
  currentOccupants: 1,
  lighting: 1,
  humidity: 3,
  noiseLevel: 1,
  hasHumans: false,
  restrictions: [],
  ...over,
})

const req = (over: Partial<GhostRequest> = {}): GhostRequest => ({
  id: 'r',
  name: 'Призрак',
  anxietyLevel: 3,
  favoriteTemperature: 'cool',
  deadline: 10,
  specialConditions: [],
  status: 'pending',
  ...over,
})

describe('placeLoad', () => {
  it('прибавляет размещённые заявки к базовым постояльцам', () => {
    const p = place({ id: 'p1', currentOccupants: 1, capacity: 3 })
    const requests = [
      req({ id: 'a', status: 'placed', assignedPlaceId: 'p1' }),
      req({ id: 'b', status: 'placed', assignedPlaceId: 'p1' }),
      req({ id: 'c', status: 'placed', assignedPlaceId: 'other' }),
      req({ id: 'd', status: 'pending', assignedPlaceId: 'p1' }),
    ]
    expect(placeLoad(p, requests)).toEqual({
      base: 1,
      placed: 2,
      total: 3,
      free: 0,
      overCapacity: false,
    })
  })

  it('overCapacity, когда total > capacity', () => {
    const p = place({ id: 'p1', currentOccupants: 3, capacity: 3 })
    const requests = [req({ id: 'a', status: 'placed', assignedPlaceId: 'p1' })]
    expect(placeLoad(p, requests)).toMatchObject({ total: 4, free: -1, overCapacity: true })
  })

  it('excludeRequestId не учитывает саму заявку', () => {
    const p = place({ id: 'p1', currentOccupants: 0, capacity: 3 })
    const requests = [req({ id: 'a', status: 'placed', assignedPlaceId: 'p1' })]
    expect(placeLoad(p, requests, { excludeRequestId: 'a' }).total).toBe(0)
  })
})

describe('resolveOccupancy', () => {
  it('переносит фактическую загрузку в Place.currentOccupants', () => {
    const places = [place({ id: 'p1', currentOccupants: 1, capacity: 5 })]
    const requests = [
      req({ id: 'a', status: 'placed', assignedPlaceId: 'p1' }),
      req({ id: 'b', status: 'placed', assignedPlaceId: 'p1' }),
    ]
    expect(resolveOccupancy(places, requests)[0].currentOccupants).toBe(3)
  })
})
