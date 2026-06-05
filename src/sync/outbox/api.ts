import { getOutboxStore } from "./index";

export async function retryOutboxJob(id: number): Promise<boolean> {
  return getOutboxStore().retryJob(id);
}

export async function listOutboxJobs(
  status?: import("../types").OutboxStatus,
  limit?: number,
) {
  return getOutboxStore().list(status, limit);
}

export async function getOutboxCounts() {
  return getOutboxStore().countByStatus();
}
