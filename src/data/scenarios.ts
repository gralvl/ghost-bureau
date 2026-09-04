import { mockPlaces } from './mockPlaces'
import { mockRequests } from './mockRequests'

// Наборы данных для демонстрации обязательных состояний из SPEC.
// raw: unknown — «битый» набор намеренно нарушает модель данных и должен
// отсеиваться validateAppData, а не типизироваться как AppState.

export type ScenarioKey = 'normal' | 'empty' | 'broken'

/** Заведомо некорректные данные: почти каждое поле нарушает инвариант. */
const brokenRaw = {
  currentDay: 0, // < 1
  places: [
    {
      id: 'dup',
      name: 'Покосившийся форт',
      propertyType: 'bungalow', // нет в enum
      price: 'дорого', // не число
      architecturalStyle: 'baroque', // нет в enum
      capacity: -4, // < 0
      currentOccupants: 2,
      lighting: 8, // вне 1–5
      humidity: 0, // вне 1–5
      noiseLevel: 3,
      hasHumans: 'нет', // не boolean
      restrictions: ['attic_available', 'has_wifi'], // has_wifi недопустим
    },
    {
      id: 'dup', // дубликат id
      name: '',
      propertyType: 'castle',
      price: 100,
      architecturalStyle: 'gothic',
      capacity: 3,
      currentOccupants: 1,
      lighting: 2,
      humidity: 4,
      noiseLevel: 2,
      hasHumans: false,
      restrictions: ['no_mirrors'],
    },
  ],
  requests: [
    {
      id: 'g1',
      name: 'Призрак с битой анкетой',
      anxietyLevel: 11, // вне 1–5
      favoriteTemperature: 'lukewarm', // нет в enum
      deadline: 'на днях', // не число
      specialConditions: ['likes_spiders', 'needs_attic'], // likes_spiders недопустим
      status: 'floating', // нет в enum
      assignedPlaceId: 'place-404', // висячая ссылка
    },
    {
      id: 'g1', // дубликат id
      name: 'Безымянный',
      anxietyLevel: 3,
      favoriteTemperature: 'cold',
      deadline: 4,
      specialConditions: [],
      status: 'placed', // placed без assignedPlaceId
    },
  ],
}

export const scenarios: Record<ScenarioKey, { label: string; raw: unknown }> = {
  normal: {
    label: 'обычные данные',
    raw: { currentDay: 1, requests: mockRequests, places: mockPlaces },
  },
  empty: {
    label: 'пустой список заявок',
    raw: { currentDay: 1, requests: [], places: mockPlaces },
  },
  broken: {
    label: 'битые данные',
    raw: brokenRaw,
  },
}
