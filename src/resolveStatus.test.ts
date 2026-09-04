import { describe, expect, it } from 'vitest'
import { recomputeStatuses, resolveRequestStatus } from './resolveStatus'
import type { GhostRequest, Place } from './types'

const place = (over: Partial<Place> = {}): Place => ({
  id: 'p',
  name: 'Место',
  propertyType: 'castle',
  price: 0,
  architecturalStyle: 'gothic',
  capacity: 3,
  currentOccupants: 0,
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

describe('resolveRequestStatus', () => {
  it('без назначения и с подходящим местом → pending', () => {
    const p = place({ id: 'p1' })
    const r = req()
    expect(resolveRequestStatus(r, [p], [r], 1)).toEqual({ status: 'pending', reason: null })
  })

  it('без назначения и без подходящего места → unplaceable с причиной', () => {
    const p = place({ id: 'p1', capacity: 1, currentOccupants: 1 })
    const r = req()
    expect(resolveRequestStatus(r, [p], [r], 1)).toEqual({
      status: 'unplaceable',
      reason: 'нет свободных мест',
    })
  })

  it('назначено без конфликта → placed, reason null', () => {
    const p = place({ id: 'p1' })
    const r = req({ status: 'placed', assignedPlaceId: 'p1' })
    expect(resolveRequestStatus(r, [p], [r], 1)).toEqual({ status: 'placed', reason: null })
  })

  it('назначено с конфликтом → статус остаётся placed, но с причиной (предупреждение, не запрет)', () => {
    const p = place({ id: 'p1', lighting: 5 })
    const r = req({ status: 'placed', assignedPlaceId: 'p1', specialConditions: ['needs_darkness'] })
    expect(resolveRequestStatus(r, [p], [r], 1)).toEqual({
      status: 'placed',
      reason: 'недостаточно темно',
    })
  })

  it('размещено с истёкшим дедлайном, но без реального конфликта по месту → reason null', () => {
    const p = place({ id: 'p1' })
    const r = req({ status: 'placed', assignedPlaceId: 'p1', deadline: 1 })
    // currentDay 2 > deadline 1 — дедлайн просрочен, но это не атрибут места.
    expect(resolveRequestStatus(r, [p], [r], 2)).toEqual({ status: 'placed', reason: null })
  })

  it('размещено с истёкшим дедлайном И реальным конфликтом → показывает конфликт по месту, не дедлайн', () => {
    const p = place({ id: 'p1', lighting: 5 })
    const r = req({
      status: 'placed',
      assignedPlaceId: 'p1',
      deadline: 1,
      specialConditions: ['needs_darkness'],
    })
    expect(resolveRequestStatus(r, [p], [r], 2)).toEqual({
      status: 'placed',
      reason: 'недостаточно темно',
    })
  })
})

describe('recomputeStatuses', () => {
  it('просроченный дедлайн переводит pending-заявку в unplaceable при смене дня', () => {
    const p = place({ id: 'p1' })
    const r = req({ id: 'a', deadline: 1, status: 'pending' })

    expect(recomputeStatuses([r], [p], 1)[0].status).toBe('pending')
    expect(recomputeStatuses([r], [p], 2)[0].status).toBe('unplaceable')
  })

  it('освобождение места разблокирует другую unplaceable-заявку', () => {
    const p = place({ id: 'p1', capacity: 1, currentOccupants: 0 })
    const a = req({ id: 'a', status: 'placed', assignedPlaceId: 'p1' })
    const b = req({ id: 'b', status: 'unplaceable' })

    const stillBlocked = recomputeStatuses([a, b], [p], 1)
    expect(stillBlocked.find((x) => x.id === 'b')?.status).toBe('unplaceable')

    const aCleared: GhostRequest = { ...a, assignedPlaceId: undefined }
    const unblocked = recomputeStatuses([aCleared, b], [p], 1)
    expect(unblocked.find((x) => x.id === 'b')?.status).toBe('pending')
  })

  it('не создаёт новый объект заявки, если статус не изменился', () => {
    const p = place({ id: 'p1' })
    const r = req({ id: 'a', status: 'pending' })
    const [result] = recomputeStatuses([r], [p], 1)
    expect(result).toBe(r)
  })
})
