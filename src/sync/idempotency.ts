export function createIdempotencyKey(parts: {
  entityType: string;
  entityLocalId?: string;
  action: string;
  payloadVersion?: string | number;
  explicitKey?: string;
}): string {
  if (parts.explicitKey) return parts.explicitKey;
  const base = [
    parts.entityType,
    parts.entityLocalId ?? "_",
    parts.action,
    parts.payloadVersion ?? "0",
  ].join(":");
  return `idem:${hashString(base)}`;
}

function hashString(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export const IDEMPOTENCY_HTTP_HEADER = "Idempotency-Key";
