import type { GhostRequest } from '../types'

/**
 * 8 заявок. currentDay стартует с 1.
 *
 * Разброс: anxietyLevel покрывает 1–5, favoriteTemperature — все 4 значения,
 * specialConditions задевают каждый жёсткий фильтр формулы.
 *
 * Edge cases по заявкам (проверка против src/data/mockPlaces.ts):
 * - req-3 — deadline === 1: проходит на день 1, «дедлайн просрочен» на день 2.
 * - req-6 — конфликтует со всеми местами сразу → unplaceable
 *           (needs_attic + fears_mirrors + hates_noise + fears_crowds;
 *            самый частый блокер — «нет чердака»).
 * - req-4 — заранее расселена в place-4 (условий нет, конфликта нет).
 * - req-8 — fears_crowds проходит: единственное подходящее место — place-6
 *           (маленькое и сырое), запас по вместимости минимальный.
 * - req-1 — тревожность 5 против самых тихих мест.
 */
export const mockRequests: GhostRequest[] = [
  {
    id: 'req-1',
    name: 'Матильда Стонущая',
    anxietyLevel: 5,
    favoriteTemperature: 'cold',
    deadline: 3,
    specialConditions: ['needs_darkness', 'loves_dampness'],
    status: 'pending',
  },
  {
    id: 'req-2',
    name: 'Барон фон Сквозняк',
    anxietyLevel: 2,
    favoriteTemperature: 'cool',
    deadline: 6,
    specialConditions: ['needs_attic', 'fears_mirrors'],
    status: 'pending',
  },
  {
    id: 'req-3',
    name: 'Тень из Чулана',
    anxietyLevel: 4,
    favoriteTemperature: 'mild',
    deadline: 1, // на день 2 уже просрочено
    specialConditions: ['no_humans_nearby'],
    status: 'pending',
  },
  {
    id: 'req-4',
    name: 'Плакальщица Агнесса',
    anxietyLevel: 3,
    favoriteTemperature: 'warm',
    deadline: 5,
    specialConditions: [],
    status: 'placed',
    assignedPlaceId: 'place-4',
  },
  {
    id: 'req-5',
    name: 'Скрипучий Джон',
    anxietyLevel: 1,
    favoriteTemperature: 'mild',
    deadline: 9,
    specialConditions: ['hates_noise'],
    status: 'pending',
  },
  {
    id: 'req-6',
    name: 'Двойник в Зеркале',
    anxietyLevel: 5,
    favoriteTemperature: 'cold',
    deadline: 1,
    specialConditions: ['needs_attic', 'fears_mirrors', 'hates_noise', 'fears_crowds'],
    status: 'unplaceable',
  },
  {
    id: 'req-7',
    name: 'Хористка Лючия',
    anxietyLevel: 3,
    favoriteTemperature: 'mild',
    deadline: 4,
    specialConditions: ['needs_darkness', 'hates_noise'],
    status: 'pending',
  },
  {
    id: 'req-8',
    name: 'Сырой Сигизмунд',
    anxietyLevel: 4,
    favoriteTemperature: 'cool',
    deadline: 7,
    specialConditions: ['fears_crowds', 'loves_dampness'],
    status: 'pending',
  },
]
