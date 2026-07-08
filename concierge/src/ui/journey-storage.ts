import type { ConciergeSnapshot } from '../engine/orchestrator';

/**
 * Saved mid-journey state (Phase 7): if the customer leaves, they resume
 * exactly where they stopped — on this device, via localStorage for the
 * concept. Production would persist server-side against the lead.
 */
export interface SavedJourney {
  snapshot: ConciergeSnapshot;
  transcript: Array<{ id: number; role: 'concierge' | 'customer'; text: string }>;
}

function storageKey(offerId: string): string {
  return `concierge-journey-${offerId}`;
}

export function loadSavedJourney(offerId: string): SavedJourney | undefined {
  try {
    const raw = window.localStorage.getItem(storageKey(offerId));
    return raw ? (JSON.parse(raw) as SavedJourney) : undefined;
  } catch {
    return undefined;
  }
}

export function saveJourney(offerId: string, journey: SavedJourney): void {
  try {
    window.localStorage.setItem(storageKey(offerId), JSON.stringify(journey));
  } catch {
    // Storage may be unavailable (private mode); the journey continues in memory.
  }
}

export function clearSavedJourney(offerId: string): void {
  try {
    window.localStorage.removeItem(storageKey(offerId));
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function hasSavedJourney(offerId: string): boolean {
  return loadSavedJourney(offerId) !== undefined;
}
