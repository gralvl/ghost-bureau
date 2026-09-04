import type { AppState } from './types'

// Валидация входных данных приложения. Возвращает список человекочитаемых
// ошибок для экрана «битые данные» (обязательное состояние из SPEC).

const CONDITIONS = new Set([
  'needs_attic',
  'fears_mirrors',
  'no_humans_nearby',
  'loves_dampness',
  'hates_noise',
  'needs_darkness',
  'fears_crowds',
])
const TEMPERATURES = new Set(['cold', 'cool', 'mild', 'warm'])
const STATUSES = new Set(['pending', 'placed', 'unplaceable'])
const PROPERTY_TYPES = new Set(['castle', 'lighthouse', 'library', 'theater', 'factory_basement'])
const STYLES = new Set(['gothic', 'victorian', 'modernist', 'brutalist', 'rustic'])
const RESTRICTIONS = new Set(['attic_available', 'no_mirrors'])

export type ValidationResult =
  | { ok: true; data: AppState }
  | { ok: false; errors: string[] }

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isRating = (v: unknown): boolean => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5

export function validateAppData(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (!isObject(raw)) {
    return { ok: false, errors: ['Корень данных не является объектом'] }
  }

  if (!Number.isInteger(raw.currentDay) || (raw.currentDay as number) < 1) {
    errors.push(
      `currentDay должен быть целым числом ≥ 1 (получено: ${JSON.stringify(raw.currentDay)})`,
    )
  }

  const placeIds = new Set<string>()
  const places = raw.places

  if (!Array.isArray(places)) {
    errors.push('places должен быть массивом')
  } else {
    places.forEach((p, i) => {
      const at = `место #${i + 1}`
      if (!isObject(p)) {
        errors.push(`${at}: не объект`)
        return
      }
      if (typeof p.id !== 'string' || p.id === '') errors.push(`${at}: пустой или нестроковый id`)
      else if (placeIds.has(p.id)) errors.push(`${at}: дублирующийся id «${p.id}»`)
      else placeIds.add(p.id)

      if (typeof p.name !== 'string' || p.name === '') errors.push(`${at}: пустое имя`)
      if (!PROPERTY_TYPES.has(p.propertyType as string))
        errors.push(`${at}: неизвестный propertyType «${String(p.propertyType)}»`)
      if (!STYLES.has(p.architecturalStyle as string))
        errors.push(`${at}: неизвестный architecturalStyle «${String(p.architecturalStyle)}»`)
      if (typeof p.price !== 'number' || !Number.isFinite(p.price))
        errors.push(`${at}: price не число`)
      if (!Number.isInteger(p.capacity) || (p.capacity as number) < 0)
        errors.push(`${at}: capacity должен быть целым ≥ 0`)
      if (!Number.isInteger(p.currentOccupants) || (p.currentOccupants as number) < 0)
        errors.push(`${at}: currentOccupants должен быть целым ≥ 0`)
      if (!isRating(p.lighting)) errors.push(`${at}: lighting вне диапазона 1–5`)
      if (!isRating(p.humidity)) errors.push(`${at}: humidity вне диапазона 1–5`)
      if (!isRating(p.noiseLevel)) errors.push(`${at}: noiseLevel вне диапазона 1–5`)
      if (typeof p.hasHumans !== 'boolean') errors.push(`${at}: hasHumans не boolean`)
      if (!Array.isArray(p.restrictions) || p.restrictions.some((r) => !RESTRICTIONS.has(r as string)))
        errors.push(`${at}: restrictions содержит недопустимые значения`)
    })
  }

  const requestIds = new Set<string>()
  const requests = raw.requests

  if (!Array.isArray(requests)) {
    errors.push('requests должен быть массивом')
  } else {
    requests.forEach((r, i) => {
      const at = `заявка #${i + 1}`
      if (!isObject(r)) {
        errors.push(`${at}: не объект`)
        return
      }
      if (typeof r.id !== 'string' || r.id === '') errors.push(`${at}: пустой или нестроковый id`)
      else if (requestIds.has(r.id)) errors.push(`${at}: дублирующийся id «${r.id}»`)
      else requestIds.add(r.id)

      if (typeof r.name !== 'string' || r.name === '') errors.push(`${at}: пустое имя`)
      if (!isRating(r.anxietyLevel)) errors.push(`${at}: anxietyLevel вне диапазона 1–5`)
      if (!TEMPERATURES.has(r.favoriteTemperature as string))
        errors.push(`${at}: неизвестная favoriteTemperature «${String(r.favoriteTemperature)}»`)
      if (!Number.isInteger(r.deadline))
        errors.push(`${at}: deadline должен быть целым числом (получено: ${JSON.stringify(r.deadline)})`)
      if (
        !Array.isArray(r.specialConditions) ||
        r.specialConditions.some((c) => !CONDITIONS.has(c as string))
      )
        errors.push(`${at}: specialConditions содержит значения не из типа Condition`)
      if (!STATUSES.has(r.status as string))
        errors.push(`${at}: неизвестный status «${String(r.status)}»`)
      if (r.assignedPlaceId !== undefined) {
        if (typeof r.assignedPlaceId !== 'string') {
          errors.push(`${at}: assignedPlaceId не строка`)
        } else {
          if (Array.isArray(places) && !placeIds.has(r.assignedPlaceId))
            errors.push(
              `${at}: assignedPlaceId «${r.assignedPlaceId}» не ссылается на существующее место`,
            )
          if (r.status !== 'placed')
            errors.push(
              `${at}: assignedPlaceId задан при статусе «${String(r.status)}» — допустимо только при placed`,
            )
        }
      }
      if (r.status === 'placed' && r.assignedPlaceId === undefined)
        errors.push(`${at}: статус placed без assignedPlaceId`)
    })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: raw as unknown as AppState }
}
