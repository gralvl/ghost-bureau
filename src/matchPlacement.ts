import type { Condition, GhostRequest, Place } from './types'

// Реализация раздела «Формула подбора» из SPEC.md.
// Декоративные поля Place (price, architecturalStyle, propertyType) в логике
// НЕ участвуют — ни в фильтрах, ни в скоринге.

// ── Результат ───────────────────────────────────────────────────────────────

export interface MatchSuccess {
  placeId: string
  /** compatibility score, 0–100, округлён. */
  score: number
  /** 1–2 короткие фразы-объяснения. */
  reasons: string[]
}

export interface MatchFailure {
  unplaceable: true
  reason: string
}

export type MatchResult = MatchSuccess | MatchFailure

// ── Жёсткие фильтры ─────────────────────────────────────────────────────────

/** Формулировки причин — строго из SPEC.md. */
export const BLOCK_REASONS = {
  noCapacity: 'нет свободных мест',
  deadlinePassed: 'дедлайн просрочен',
  noAttic: 'нет чердака',
  hasMirrors: 'есть зеркала',
  humansNearby: 'рядом люди',
  notDampEnough: 'недостаточно сыро',
  tooNoisy: 'слишком шумно',
  notDarkEnough: 'недостаточно темно',
  tooCrowded: 'слишком людное место',
} as const

/**
 * Порядок жёстких фильтров из SPEC. Задаёт и то, какую причину фиксируем
 * первой, и детерминированное разрешение ничьих при выборе «самого частого
 * блокирующего фактора».
 */
const REASON_ORDER: readonly string[] = [
  BLOCK_REASONS.noCapacity,
  BLOCK_REASONS.deadlinePassed,
  BLOCK_REASONS.noAttic,
  BLOCK_REASONS.hasMirrors,
  BLOCK_REASONS.humansNearby,
  BLOCK_REASONS.notDampEnough,
  BLOCK_REASONS.tooNoisy,
  BLOCK_REASONS.notDarkEnough,
  BLOCK_REASONS.tooCrowded,
]

const wants = (conditions: Condition[], c: Condition): boolean => conditions.includes(c)

/**
 * Первая сработавшая причина жёсткого фильтра для места (в порядке SPEC),
 * либо null, если место проходит все фильтры.
 */
export function hardFilterReason(
  request: GhostRequest,
  place: Place,
  currentDay: number,
): string | null {
  const cond = request.specialConditions

  if (place.capacity <= place.currentOccupants) return BLOCK_REASONS.noCapacity
  if (request.deadline < currentDay) return BLOCK_REASONS.deadlinePassed
  if (wants(cond, 'needs_attic') && !place.restrictions.includes('attic_available'))
    return BLOCK_REASONS.noAttic
  if (wants(cond, 'fears_mirrors') && !place.restrictions.includes('no_mirrors'))
    return BLOCK_REASONS.hasMirrors
  if (wants(cond, 'no_humans_nearby') && place.hasHumans) return BLOCK_REASONS.humansNearby
  if (wants(cond, 'loves_dampness') && place.humidity < 4) return BLOCK_REASONS.notDampEnough
  if (wants(cond, 'hates_noise') && place.noiseLevel > 2) return BLOCK_REASONS.tooNoisy
  if (wants(cond, 'needs_darkness') && place.lighting > 2) return BLOCK_REASONS.notDarkEnough
  if (wants(cond, 'fears_crowds') && place.capacity > 3) return BLOCK_REASONS.tooCrowded
  return null
}

// ── Мягкий скоринг (сумма = 100) ────────────────────────────────────────────

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x))

export interface ScoreBreakdown {
  /** тревожность vs шум: 0–30 */
  noise: number
  /** темперамент vs влажность/освещение: 0–25 */
  temperature: number
  /** запас по вместимости: 0–20 */
  capacity: number
  /** дедлайн не поджимает: 0–25 */
  deadline: number
  /** сумма: 0–100 */
  total: number
}

/**
 * Эвристика темперамента: cold/cool → влажнее и темнее, mild/warm → суше и
 * светлее (SPEC задаёт только направление, конкретные цели — здесь).
 */
const TEMPERATURE_TARGET: Record<
  GhostRequest['favoriteTemperature'],
  { humidity: number; lighting: number }
> = {
  cold: { humidity: 5, lighting: 2 },
  cool: { humidity: 4, lighting: 2 },
  mild: { humidity: 2, lighting: 3 },
  warm: { humidity: 1, lighting: 4 },
}

/** Разбивка score для одного (уже прошедшего фильтры) места. */
export function scorePlace(
  request: GhostRequest,
  place: Place,
  currentDay: number,
): ScoreBreakdown {
  // тревожность vs шум — чем ближе значения, тем лучше (макс. расхождение = 4)
  const noise = 30 * clamp01(1 - Math.abs(request.anxietyLevel - place.noiseLevel) / 4)

  // темперамент — близость влажности и освещения к целевым
  const target = TEMPERATURE_TARGET[request.favoriteTemperature]
  const tempMiss =
    (Math.abs(place.humidity - target.humidity) + Math.abs(place.lighting - target.lighting)) / 8
  const temperature = 25 * clamp01(1 - tempMiss)

  // запас по вместимости — 4+ свободных мест = максимум
  const free = place.capacity - place.currentOccupants
  const capacity = 20 * clamp01(free / 4)

  // дедлайн не поджимает — 5+ игровых дней в запасе = максимум
  const daysLeft = request.deadline - currentDay
  const deadline = 25 * clamp01(daysLeft / 5)

  return { noise, temperature, capacity, deadline, total: noise + temperature + capacity + deadline }
}

/** 1–2 короткие фразы по самым сильным составляющим score. */
function explain(b: ScoreBreakdown): string[] {
  const parts = [
    { text: 'уровень шума под стать тревожности', weight: b.noise / 30 },
    { text: 'влажность и свет подходят темпераменту', weight: b.temperature / 25 },
    { text: 'много свободного места', weight: b.capacity / 20 },
    { text: 'дедлайн не поджимает', weight: b.deadline / 25 },
  ].sort((x, y) => y.weight - x.weight)

  const strong = parts.filter((p) => p.weight >= 0.6)
  return (strong.length > 0 ? strong : parts.slice(0, 1)).slice(0, 2).map((p) => p.text)
}

/** Самый частый блокирующий фактор; ничьи — по порядку фильтров из SPEC. */
function mostCommonReason(reasons: string[]): string {
  const counts = new Map<string, number>()
  for (const r of reasons) counts.set(r, (counts.get(r) ?? 0) + 1)

  let best: string = BLOCK_REASONS.noCapacity
  let bestCount = 0
  for (const reason of REASON_ORDER) {
    const c = counts.get(reason) ?? 0
    if (c > bestCount) {
      bestCount = c
      best = reason
    }
  }
  return best
}

// ── Точка входа ─────────────────────────────────────────────────────────────

/**
 * Подбирает лучшее место для заявки.
 * @returns { placeId, score, reasons } либо { unplaceable: true, reason }.
 */
export function matchPlacement(
  request: GhostRequest,
  places: Place[],
  currentDay: number,
): MatchResult {
  const blocked: string[] = []
  const passed: Place[] = []

  for (const place of places) {
    const reason = hardFilterReason(request, place, currentDay)
    if (reason === null) passed.push(place)
    else blocked.push(reason)
  }

  if (passed.length === 0) {
    return { unplaceable: true, reason: mostCommonReason(blocked) }
  }

  let best = passed[0]
  let bestScore = scorePlace(request, best, currentDay)
  for (let i = 1; i < passed.length; i++) {
    const s = scorePlace(request, passed[i], currentDay)
    if (s.total > bestScore.total) {
      best = passed[i]
      bestScore = s
    }
  }

  return { placeId: best.id, score: Math.round(bestScore.total), reasons: explain(bestScore) }
}
