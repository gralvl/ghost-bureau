import type { AppState } from '../types'
import { mockRequests } from './mockRequests'
import { mockPlaces } from './mockPlaces'

export { mockRequests } from './mockRequests'
export { mockPlaces } from './mockPlaces'

/** Начальное состояние приложения. currentDay стартует с 1. */
export const initialState: AppState = {
  currentDay: 1,
  requests: mockRequests,
  places: mockPlaces,
}
