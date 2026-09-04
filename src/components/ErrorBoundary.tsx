import { Component, type ErrorInfo, type ReactNode } from 'react'

// Обязательное состояние из SPEC: «Общая ошибка». Ловит исключения рендера,
// чтобы приложение не падало в белый экран.

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Перехвачена ошибка рендера:', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-red-800/60 bg-red-950/30 p-6">
          <h1 className="text-lg font-semibold text-red-200">Что-то сломалось</h1>
          <p className="text-sm text-slate-300">
            Приложение упало при отрисовке. Это защитный экран, чтобы не остаться
            с пустой страницей.
          </p>
          <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-red-300">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }
}
