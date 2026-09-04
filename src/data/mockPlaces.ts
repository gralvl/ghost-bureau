import type { Place } from '../types'

/**
 * 6 мест — каждый propertyType из списка представлен (castle встречается дважды).
 * Параметры подобраны так, чтобы срабатывали все жёсткие фильтры формулы
 * и покрывались обязательные состояния из SPEC.
 *
 * Edge cases по местам:
 * - place-3 (library)  — переполнено: currentOccupants > capacity.
 * - place-6 (castle)   — заполнено ровно под завязку: capacity === currentOccupants.
 * - place-2 (lighthouse), place-4 (theater) — БЕЗ 'no_mirrors' → «есть зеркала».
 * - place-3, place-4, place-6 — БЕЗ 'attic_available' → «нет чердака».
 * - place-2 — единственное место с людьми и одновременно очень светлое.
 * - place-4 — самое шумное и самое людное (capacity > 3).
 * - place-5 — предельно сырое и тёмное, но шумноватое.
 */
export const mockPlaces: Place[] = [
  {
    id: 'place-1',
    name: 'Замок Чёрный Шип',
    propertyType: 'castle',
    price: 1200,
    architecturalStyle: 'gothic',
    capacity: 5,
    currentOccupants: 2,
    lighting: 1, // тьма
    humidity: 4, // сыро
    noiseLevel: 1,
    hasHumans: false,
    restrictions: ['attic_available', 'no_mirrors'],
  },
  {
    id: 'place-2',
    name: 'Маяк Последний Луч',
    propertyType: 'lighthouse',
    price: 800,
    architecturalStyle: 'victorian',
    capacity: 2,
    currentOccupants: 0,
    lighting: 5, // ярко — конфликт с needs_darkness
    humidity: 3, // нормально — конфликт с loves_dampness
    noiseLevel: 2,
    hasHumans: true, // смотритель живёт на маяке — конфликт с no_humans_nearby
    restrictions: ['attic_available'], // зеркала есть — конфликт с fears_mirrors
  },
  {
    id: 'place-3',
    name: 'Библиотека Тихих Страниц',
    propertyType: 'library',
    price: 500,
    architecturalStyle: 'modernist',
    capacity: 3,
    currentOccupants: 4, // ПЕРЕПОЛНЕНО → жёсткий фильтр «нет свободных мест»
    lighting: 3,
    humidity: 2,
    noiseLevel: 1,
    hasHumans: true,
    restrictions: ['no_mirrors'], // без чердака
  },
  {
    id: 'place-4',
    name: 'Театр Разбитой Люстры',
    propertyType: 'theater',
    price: 950,
    architecturalStyle: 'victorian',
    capacity: 8,
    currentOccupants: 3,
    lighting: 2, // сумерки
    humidity: 3,
    noiseLevel: 4, // шумно — конфликт с hates_noise
    hasHumans: true,
    restrictions: [], // без чердака И с зеркалами (гримёрки)
  },
  {
    id: 'place-5',
    name: 'Фабричный Подвал №7',
    propertyType: 'factory_basement',
    price: 300,
    architecturalStyle: 'brutalist',
    capacity: 6,
    currentOccupants: 1,
    lighting: 1, // тьма
    humidity: 5, // очень сыро
    noiseLevel: 3, // гудят трубы — конфликт с hates_noise
    hasHumans: false,
    restrictions: ['attic_available', 'no_mirrors'],
  },
  {
    id: 'place-6',
    name: 'Замок Туманный Кряж',
    propertyType: 'castle',
    price: 700,
    architecturalStyle: 'rustic',
    capacity: 3,
    currentOccupants: 3, // заполнено под завязку → «нет свободных мест»
    lighting: 2, // сумерки
    humidity: 4, // сыро
    noiseLevel: 2,
    hasHumans: false,
    restrictions: ['no_mirrors'], // без чердака
  },
]
