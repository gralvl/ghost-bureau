import { describe, expect, it } from 'vitest'
import { validateAppData } from './validateData'
import { scenarios } from './data/scenarios'

describe('validateAppData', () => {
  it('обычный набор данных проходит проверку', () => {
    expect(validateAppData(scenarios.normal.raw).ok).toBe(true)
  })

  it('пустой список заявок — валидное состояние', () => {
    expect(validateAppData(scenarios.empty.raw).ok).toBe(true)
  })

  it('битый набор отклоняется с перечнем конкретных ошибок', () => {
    const res = validateAppData(scenarios.broken.raw)
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.errors.length).toBeGreaterThan(5)
      expect(res.errors.join('\n')).toContain('дублирующийся id')
    }
  })

  it('не-объект на входе отклоняется', () => {
    expect(validateAppData(null).ok).toBe(false)
    expect(validateAppData(42).ok).toBe(false)
    expect(validateAppData([]).ok).toBe(false)
  })

  it('висячий assignedPlaceId ловится', () => {
    const res = validateAppData({
      currentDay: 1,
      places: [],
      requests: [
        {
          id: 'r1',
          name: 'Тест',
          anxietyLevel: 3,
          favoriteTemperature: 'cold',
          deadline: 2,
          specialConditions: [],
          status: 'placed',
          assignedPlaceId: 'missing',
        },
      ],
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.errors.join('\n')).toContain('assignedPlaceId')
  })
})
