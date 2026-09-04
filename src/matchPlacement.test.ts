import { describe, expect, it } from 'vitest'
import { BLOCK_REASONS, matchPlacement } from './matchPlacement'
import type { GhostRequest, Place } from './types'

const DAY = 1

/** Заявка без особых условий: сама по себе ничего не блокирует. */
const request = (over: Partial<GhostRequest> = {}): GhostRequest => ({
  id: 'r',
  name: 'Тестовый призрак',
  anxietyLevel: 3,
  favoriteTemperature: 'cool',
  deadline: 10,
  specialConditions: [],
  status: 'pending',
  ...over,
})

/** Место, проходящее все жёсткие фильтры для «пустой» заявки. */
const place = (over: Partial<Place> = {}): Place => ({
  id: 'p',
  name: 'Эталонное место',
  propertyType: 'castle',
  price: 999,
  architecturalStyle: 'gothic',
  capacity: 5,
  currentOccupants: 0,
  lighting: 1,
  humidity: 5,
  noiseLevel: 1,
  hasHumans: false,
  restrictions: ['attic_available', 'no_mirrors'],
  ...over,
})

describe('matchPlacement — жёсткие фильтры (каждый исключает единственное место)', () => {
  it('capacity <= currentOccupants → «нет свободных мест»', () => {
    const res = matchPlacement(request(), [place({ capacity: 3, currentOccupants: 3 })], DAY)
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.noCapacity })
  })

  it('deadline < currentDay → «дедлайн просрочен»', () => {
    const res = matchPlacement(request({ deadline: 0 }), [place()], DAY)
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.deadlinePassed })
  })

  it('needs_attic без attic_available → «нет чердака»', () => {
    const res = matchPlacement(
      request({ specialConditions: ['needs_attic'] }),
      [place({ restrictions: ['no_mirrors'] })],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.noAttic })
  })

  it('fears_mirrors без no_mirrors → «есть зеркала»', () => {
    const res = matchPlacement(
      request({ specialConditions: ['fears_mirrors'] }),
      [place({ restrictions: ['attic_available'] })],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.hasMirrors })
  })

  it('no_humans_nearby + hasHumans → «рядом люди»', () => {
    const res = matchPlacement(
      request({ specialConditions: ['no_humans_nearby'] }),
      [place({ hasHumans: true })],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.humansNearby })
  })

  it('loves_dampness + humidity < 4 → «недостаточно сыро»', () => {
    const res = matchPlacement(
      request({ specialConditions: ['loves_dampness'] }),
      [place({ humidity: 3 })],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.notDampEnough })
  })

  it('hates_noise + noiseLevel > 2 → «слишком шумно»', () => {
    const res = matchPlacement(
      request({ specialConditions: ['hates_noise'] }),
      [place({ noiseLevel: 3 })],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.tooNoisy })
  })

  it('needs_darkness + lighting > 2 → «недостаточно темно»', () => {
    const res = matchPlacement(
      request({ specialConditions: ['needs_darkness'] }),
      [place({ lighting: 3 })],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.notDarkEnough })
  })

  it('fears_crowds + capacity > 3 → «слишком людное место»', () => {
    const res = matchPlacement(
      request({ specialConditions: ['fears_crowds'] }),
      [place({ capacity: 4, currentOccupants: 0 })],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.tooCrowded })
  })
})

describe('matchPlacement — мягкий скоринг', () => {
  it('из прошедших фильтры мест выбирает место с максимальным score', () => {
    const req = request({ anxietyLevel: 1, favoriteTemperature: 'cold', deadline: 10 })

    // Оба места проходят жёсткие фильтры. tight хуже по всем четырём
    // составляющим: шум далёк от тревожности, сухо и светло, почти нет
    // запаса по вместимости. roomy — противоположность.
    const tight = place({
      id: 'tight',
      capacity: 2,
      currentOccupants: 1,
      noiseLevel: 5,
      humidity: 1,
      lighting: 5,
    })
    const roomy = place({
      id: 'roomy',
      capacity: 10,
      currentOccupants: 0,
      noiseLevel: 1,
      humidity: 5,
      lighting: 1,
    })

    // tight идёт первым — проверяем, что выбор не сводится к «первому в списке».
    const res = matchPlacement(req, [tight, roomy], DAY)

    expect(res).toMatchObject({ placeId: 'roomy' })
    if ('score' in res) {
      expect(res.score).toBeGreaterThan(90)
      expect(res.score).toBeLessThanOrEqual(100)
      expect(res.reasons.length).toBeGreaterThanOrEqual(1)
      expect(res.reasons.length).toBeLessThanOrEqual(2)
    }
  })
})

describe('matchPlacement — прочее', () => {
  it('единственное подходящее место возвращается с объяснением', () => {
    const res = matchPlacement(request(), [place()], DAY)
    expect(res).toMatchObject({ placeId: 'p' })
    if ('score' in res) {
      expect(res.score).toBeGreaterThanOrEqual(0)
      expect(res.score).toBeLessThanOrEqual(100)
      expect(res.reasons.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('причина unplaceable — самый частый блокирующий фактор среди мест', () => {
    const req = request({ specialConditions: ['needs_attic'] })
    const res = matchPlacement(
      req,
      [
        place({ id: 'a', restrictions: ['no_mirrors'] }), // нет чердака
        place({ id: 'b', restrictions: ['no_mirrors'] }), // нет чердака
        place({ id: 'c', capacity: 1, currentOccupants: 1 }), // нет свободных мест
      ],
      DAY,
    )
    expect(res).toEqual({ unplaceable: true, reason: BLOCK_REASONS.noAttic })
  })
})
