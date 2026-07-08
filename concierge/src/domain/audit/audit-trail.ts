/**
 * Append-only record of every material step in the onboarding journey.
 * Regulators expect banks to evidence what was collected, what was decided,
 * and why — so the trail stores decisions with their reasons, not just events.
 */
export interface AuditEntry {
  at: string;
  event: string;
  detail: string;
}

export interface AuditTrail {
  readonly entries: ReadonlyArray<AuditEntry>;
  record(event: string, detail: string): void;
}

export function createAuditTrail(clock: () => Date = () => new Date()): AuditTrail {
  const entries: AuditEntry[] = [];
  return {
    entries,
    record(event, detail) {
      entries.push({ at: clock().toISOString(), event, detail });
    },
  };
}
