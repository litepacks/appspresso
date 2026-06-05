import { getOutboxStore } from "./outbox";
import { createIdempotencyKey } from "./idempotency";
import type { EntitySyncMeta } from "./entity-meta";
import type { SyncAction } from "./provider";
import type { OutboxEnqueueOptions } from "./types";

export type EnqueueEntityMutationInput = {
  entityType: string;
  meta: Pick<EntitySyncMeta, "local_id">;
  action: SyncAction;
  operation?: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
};

/** Write path: enqueue durable outbox job (local entity write is host-owned). */
export async function enqueueEntityMutation(
  input: EnqueueEntityMutationInput,
): Promise<void> {
  const options: OutboxEnqueueOptions = {
    entityType: input.entityType,
    entityLocalId: input.meta.local_id,
    action: input.action,
    operation: input.operation,
    payload: input.payload,
    idempotencyKey:
      input.idempotencyKey ??
      createIdempotencyKey({
        entityType: input.entityType,
        entityLocalId: input.meta.local_id,
        action: input.action,
        payloadVersion: JSON.stringify(input.payload).length,
      }),
  };
  await getOutboxStore().enqueue(options);
}
