// Модель данных — ровно по SPEC.md, раздел «Модель данных».

/** Оценка по шкале 1–5 (тревожность, освещение, влажность, шум). */
export type Rating = 1 | 2 | 3 | 4 | 5

// ── GhostRequest ────────────────────────────────────────────────────────────

/** Особые условия заявки. Строго из этого набора. */
export type Condition =
  | 'needs_attic'
  | 'fears_mirrors'
  | 'no_humans_nearby'
  | 'loves_dampness'
  | 'hates_noise'
  | 'needs_darkness'
  | 'fears_crowds'

export type FavoriteTemperature = 'cold' | 'cool' | 'mild' | 'warm'

export type RequestStatus = 'pending' | 'placed' | 'unplaceable'

export interface GhostRequest {
  id: string
  name: string
  anxietyLevel: Rating
  favoriteTemperature: FavoriteTemperature
  /** Номер игрового дня, не реальная дата. */
  deadline: number
  /** Строго из типа Condition. */
  specialConditions: Condition[]
  status: RequestStatus
  assignedPlaceId?: string
}

// ── Place ───────────────────────────────────────────────────────────────────

export type PropertyType =
  | 'castle'
  | 'lighthouse'
  | 'library'
  | 'theater'
  | 'factory_basement'

/** Декоративно, в формуле не участвует. */
export type ArchitecturalStyle =
  | 'gothic'
  | 'victorian'
  | 'modernist'
  | 'brutalist'
  | 'rustic'

/**
 * Только фичи без отдельного поля.
 * Всё остальное проверяется напрямую по полям Place.
 */
export type Restriction = 'attic_available' | 'no_mirrors'

export interface Place {
  id: string
  name: string
  propertyType: PropertyType
  /** Декоративно, в формуле не участвует. */
  price: number
  /** Декоративно, в формуле не участвует. */
  architecturalStyle: ArchitecturalStyle
  capacity: number
  currentOccupants: number
  /** 1 тьма · 2 сумерки · 3 тускло · 4 светло · 5 ярко */
  lighting: Rating
  /** 1 сухо · 2 слегка влажно · 3 нормально · 4 сыро · 5 очень сыро */
  humidity: Rating
  noiseLevel: Rating
  hasHumans: boolean
  restrictions: Restriction[]
}

// ── Состояние приложения ────────────────────────────────────────────────────

/**
 * currentDay — не поле заявки, а состояние приложения.
 * Стартует с 1, меняется кнопкой «Следующий день →» в шапке. Без автотаймера.
 */
export interface AppState {
  currentDay: number
  requests: GhostRequest[]
  places: Place[]
}
