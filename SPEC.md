# SPEC — Бюро переселения привидений

## Стек
- React + Vite, один SPA, TypeScript (или JS)
- Состояние — в памяти (useState/useReducer), без бэкенда и БД
- Tailwind для стилей

## Модель данных

### GhostRequest
```ts
type Condition =
  | 'needs_attic'
  | 'fears_mirrors'
  | 'no_humans_nearby'
  | 'loves_dampness'
  | 'hates_noise'
  | 'needs_darkness'
  | 'fears_crowds'

{
  id: string
  name: string
  anxietyLevel: 1-5
  favoriteTemperature: 'cold' | 'cool' | 'mild' | 'warm'
  deadline: number              // номер игрового дня, не реальная дата
  specialConditions: Condition[] // строго из типа Condition
  status: 'pending' | 'placed' | 'unplaceable'
  assignedPlaceId?: string
}
```

### Place
```ts
{
  id: string
  name: string
  propertyType: 'castle' | 'lighthouse' | 'library' | 'theater' | 'factory_basement'
  price: number                 // декоративно, в формуле не участвует
  architecturalStyle: 'gothic' | 'victorian' | 'modernist' | 'brutalist' | 'rustic'
                                 // декоративно, в формуле не участвует
  capacity: number
  currentOccupants: number
  lighting: 1-5    // 1 тьма · 2 сумерки · 3 тускло · 4 светло · 5 ярко
  humidity: 1-5    // 1 сухо · 2 слегка влажно · 3 нормально · 4 сыро · 5 очень сыро
  noiseLevel: 1-5
  hasHumans: boolean
  restrictions: ('attic_available' | 'no_mirrors')[]
              // только фичи без отдельного поля; всё остальное проверяется
              // напрямую по полям выше
}
```

Состояние приложения (не поле заявки): `currentDay: number`, стартует с 1,
меняется кнопкой "Следующий день →" в шапке. Без автотаймера.

## Формула подбора (compatibility score 0-100)

**Жёсткие фильтры** — не проходит → место исключается, причина фиксируется:
- `capacity <= currentOccupants` → "нет свободных мест"
- `deadline < currentDay` → "дедлайн просрочен"
- `needs_attic` + нет `attic_available` в restrictions → "нет чердака"
- `fears_mirrors` + нет `no_mirrors` в restrictions → "есть зеркала"
- `no_humans_nearby` + `hasHumans: true` → "рядом люди"
- `loves_dampness` + `humidity < 4` → "недостаточно сыро"
- `hates_noise` + `noiseLevel > 2` → "слишком шумно"
- `needs_darkness` + `lighting > 2` → "недостаточно темно"
- `fears_crowds` + `capacity > 3` → "слишком людное место"

**Мягкий скоринг** (только для мест, прошедших фильтры, сумма = 100):
- тревожность vs шум, чем ближе тем лучше: +30
- `favoriteTemperature` эвристически сверяется с humidity/lighting
  (cold/cool → влажнее, mild/warm → суше): +25
- запас по вместимости: +20
- дедлайн не поджимает: +25

Выбирается место с максимальным score. Объяснение — 1-2 короткие фразы.
Если после фильтров мест не осталось → `unplaceable`, причина — самый частый
блокирующий фактор среди отфильтрованных мест.

## Экраны

0. Шапка — счётчик "День {currentDay}" + кнопка "Следующий день →"
1. Список заявок — статус цветом, условия бейджами, кнопка "детали".
   У заявок со статусом `unplaceable` причина отказа видна сразу в списке
   (как короткий текст рядом со статусом), не только внутри карточки деталей
   — симметрично тому, как уже показан конфликт у `placed`-заявок.
2. Список мест — вместимость (занято/всего) считается с учётом текущих
   ручных назначений заявок (`assignedPlaceId`), не только из моковых
   `currentOccupants` — иначе цифры разъедутся с отчётом на экране 4.
3. Карточка заявки — предложенное место + объяснение, ручной выбор другого
   места с live-предупреждением при конфликте
4. Итоговый отчёт — расселено / без места / проблемные заявки / перегруженные
   места
5. AI Worklog — отдельная вкладка, пустой оформленный контейнер (секции с
   заголовками), контент добавляется вручную позже

## Обязательные состояния
- Пустой список заявок
- Заявка без подходящего места
- Место переполнено
- Ручной выбор конфликтует с условиями (warning, не жёсткий бан)
- Общая ошибка / битые данные

## Вне минимального скоупа
Форма создания новой заявки — не делать, пока не готовы шаги 1-5.