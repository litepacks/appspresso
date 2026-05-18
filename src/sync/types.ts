export type OutboxRecord = {
  id?: number;
  operation: string;
  payload: string;
  created_at: string;
  attempts: number;
  status: string;
};

export type OutboxEnqueueInput = {
  operation: string;
  payload: Record<string, unknown>;
};
