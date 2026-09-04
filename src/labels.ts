import type {
  ArchitecturalStyle,
  Condition,
  FavoriteTemperature,
  PropertyType,
  RequestStatus,
  Restriction,
} from './types'

// Человекочитаемые подписи для enum-значений модели данных.

export const conditionLabel: Record<Condition, string> = {
  needs_attic: 'нужен чердак',
  fears_mirrors: 'боится зеркал',
  no_humans_nearby: 'без людей рядом',
  loves_dampness: 'любит сырость',
  hates_noise: 'не выносит шум',
  needs_darkness: 'нужна темнота',
  fears_crowds: 'боится толпы',
}

export const temperatureLabel: Record<FavoriteTemperature, string> = {
  cold: 'холод',
  cool: 'прохлада',
  mild: 'умеренно',
  warm: 'тепло',
}

export const requestStatusLabel: Record<RequestStatus, string> = {
  pending: 'ожидает',
  placed: 'размещено',
  unplaceable: 'без места',
}

export const propertyTypeLabel: Record<PropertyType, string> = {
  castle: 'замок',
  lighthouse: 'маяк',
  library: 'библиотека',
  theater: 'театр',
  factory_basement: 'фабричный подвал',
}

export const architecturalStyleLabel: Record<ArchitecturalStyle, string> = {
  gothic: 'готика',
  victorian: 'викторианство',
  modernist: 'модернизм',
  brutalist: 'брутализм',
  rustic: 'рустик',
}

export const restrictionLabel: Record<Restriction, string> = {
  attic_available: 'есть чердак',
  no_mirrors: 'без зеркал',
}

// Словесная расшифровка шкал 1–5 (значения из SPEC.md).
export const lightingScale = ['тьма', 'сумерки', 'тускло', 'светло', 'ярко'] as const
export const humidityScale = ['сухо', 'слегка влажно', 'нормально', 'сыро', 'очень сыро'] as const
export const noiseScale = ['тишина', 'тихо', 'средне', 'шумно', 'очень шумно'] as const

/** Слово из шкалы для значения 1–5 (с защитой от выхода за границы). */
export const scaleWord = (scale: readonly string[], value: number): string =>
  scale[Math.min(Math.max(value, 1), 5) - 1]
