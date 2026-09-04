import type { ReactNode } from 'react'

// Экран 5 из SPEC: AI Worklog. Контент вставлен вручную из worklog-content.md
// (см. корень репозитория) — там источник правды; здесь только форматирование
// под UI (таблица и жирный текст упрощены до список/акцентов, смысл тот же).

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="space-y-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  )
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-slate-300">
      {children}
    </code>
  )
}

const TIMELINE = [
  {
    stage: 'Планирование',
    me: 'Обсудил задание, выбрал вариант, спроектировал модель данных, декоративные поля, игровой день вместо реальных дат',
    ai: 'Помогал структурировать спеку и промпты',
    time: '~2 часа',
  },
  {
    stage: 'Шаг 1 — типы и моки',
    me: 'Проверил соответствие SPEC.md',
    ai: 'Каркас Vite/React/TS/Tailwind, типы, 8 заявок, 6 мест',
    time: '~6 мин / ~20к',
  },
  {
    stage: 'Шаг 2 — логика подбора',
    me: 'Проверил веса формулы и тесты',
    ai: <><Code>matchPlacement</Code>, 12 юнит-тестов</>,
    time: '~4 мин / ~20к',
  },
  {
    stage: 'Шаг 3 — базовый UI',
    me: 'Проверил рендер в браузере',
    ai: 'Шапка, списки заявок и мест',
    time: '~3 мин / ~15к',
  },
  {
    stage: 'Шаг 4 — карточка заявки',
    me: 'Проверил конфликты и ручной выбор',
    ai: 'Карточка, live-предупреждения',
    time: '~3 мин',
  },
  {
    stage: 'Шаг 5 — отчёт и edge cases',
    me: 'Заметил рассинхрон занятости мест и потерю причины unplaceable, попросил исправить',
    ai: 'Отчёт, переключатель сценариев (пусто/битые данные), ErrorBoundary, синхронизация занятости',
    time: '~23 мин / ~65к',
  },
  {
    stage: 'Шаг 6 — AI Worklog',
    me: 'Проверил каркас',
    ai: 'Пустая вкладка с 4 секциями',
    time: '~1 мин / ~4к',
  },
  {
    stage: 'Финал',
    me: <>README, чеклист, деплой, <Code>/ultrareview</Code></>,
    ai: '—',
    time: '—',
  },
] as const

export function Worklog() {
  return (
    <div className="space-y-4">
      <Card title="Инструменты">
        <ul className="list-disc space-y-2 pl-4">
          <li>
            <span className="font-medium text-slate-100">Claude (Claude.ai, Sonnet 5)</span> —
            помощь с архитектурой и промптами: проектирование модели данных и формулы подбора,
            декомпозиция на этапы, ревью каждого диффа перед принятием, помощь с git/окружением,
            финальный сбор этого Worklog.
          </li>
          <li>
            <span className="font-medium text-slate-100">
              Claude Code CLI (claude-sonnet-5, claude-haiku-4-5)
            </span>{' '}
            — непосредственная реализация: каждый из 6 промптов выполнялся им в VS Code, с
            git-коммитом после каждого шага.
          </li>
        </ul>
      </Card>

      <Card title="Хронология">
        <div className="overflow-x-auto rounded-md border border-slate-800">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="px-3 py-2 font-medium">Этап</th>
                <th className="px-3 py-2 font-medium">Что делал я</th>
                <th className="px-3 py-2 font-medium">Что делал AI</th>
                <th className="px-3 py-2 font-medium">Время / токены</th>
              </tr>
            </thead>
            <tbody>
              {TIMELINE.map((row) => (
                <tr key={row.stage} className="border-b border-slate-800/60 align-top last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    {row.stage}
                  </td>
                  <td className="px-3 py-2 text-slate-400">{row.me}</td>
                  <td className="px-3 py-2 text-slate-400">{row.ai}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Суммарно за компьютером — около 5.5–6 часов вперемешку с перерывами. По данным{' '}
          <Code>/usage</Code> Claude Code: $7.69, ~31.7 млн токенов (почти всё — дешёвое повторное
          cache-чтение уже отправленного контекста, отсюда низкая цена при большом числе токенов),
          36 мин активного API-времени при 3ч 07мин общей длительности сессии — основное время
          ушло на чтение диффов и ручную проверку в браузере.
        </p>
      </Card>

      <Card title="Промпты и решения">
        <p>Промпты подавались по одному на этап.</p>
        <div>
          <p className="font-medium text-slate-100">3–5 решений, принятых самостоятельно:</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4">
            <li>
              Выбрал тему «Бюро переселения привидений» и спроектировал модель данных: поля
              заявок и мест, список из 7 особых условий, шкалу освещения/влажности 1–5.
            </li>
            <li>
              Заменил дедлайн-строку на номер игрового дня + кнопку «Следующий день →» вместо
              тикающего таймера — чтобы демонстрировать просрочку по клику, без ожидания.
            </li>
            <li>
              Разделил единый документ-спеку на три отдельных файла (контекст для себя /
              техническая спека для проекта / промпты).
            </li>
          </ol>
        </div>
      </Card>

      <Card title="Ошибки AI и доработки">
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Один <Code>git commit</Code> без <Code>-m</Code> завис на пустом сообщении в
            редакторе — Claude Code сам это заметил и на следующем шаге создал коммит со своим
            сообщением по шаблону «шаг N».
          </li>
          <li>
            На шаге 5 несколько раз подряд получил отказ в доступе на bash-команды без видимого
            диалога подтверждения и продолжал повторять попытки — итог: ~23 минуты и ~65к токенов
            на шаг, который по объёму сопоставим с шагом 2 (4 минуты). Пришлось прервать сессию
            вручную (Ctrl+C) и продолжить, сообщив AI результаты проверки самостоятельно.
          </li>
          <li>
            Изначально <Code>Place</Code> получил два поля под одну и ту же классификацию места
            (<Code>type</Code> свободной строкой и <Code>propertyType</Code> как enum) — заметил
            дублирование и попросил объединить в одно поле.
          </li>
          <li>
            После снятия размещения с просроченной заявки причина отказа переставала быть видна в
            общем списке (хотя оставалась в карточке деталей) — асимметрия в отображении
            unplaceable против placed-конфликта, исправлено отдельным уточнением перед шагом 5.
          </li>
        </ul>
        <div>
          <p className="font-medium text-slate-100">
            Что улучшил бы, если бы это был реальный продукт:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-4">
            <li>
              Настоящую персистентность вместо состояния в памяти (сейчас обновление страницы всё
              сбрасывает).
            </li>
            <li>
              Полноценную форму создания новых заявок/мест (осознанно вынесена за скоуп
              тестового).
            </li>
            <li>
              E2E-тесты поверх UI-сценариев (сейчас юнит-тесты покрывают только чистую логику
              подбора и валидацию данных, не сами компоненты).
            </li>
            <li>
              Разделить единый механизм «предупреждение, не бан» для переполнения и для конфликта
              условий на два разных правила, если продукту потребуется более строгий контроль
              вместимости.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
