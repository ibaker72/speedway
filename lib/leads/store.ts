import { supabaseInsert } from "@/lib/supabase";

interface CreateLeadInput {
  source: string;
  name?: string;
  email?: string;
  phone?: string;
  payload?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
  notified_at: string | null;
  /**
   * False when the database predates notification tracking
   * (20261122_lead_management_and_notifications.sql not applied): the caller
   * then emails directly instead of through the tracked delivery job.
   */
  tracked: boolean;
}

/** If an attempt dies before it is recorded, the retry job picks the lead up after this. */
export const FIRST_ATTEMPT_GRACE_MS = 2 * 60_000;

function isMissingColumn(error: string): boolean {
  return /PGRST204|column .* does not exist|Could not find the '.*' column/i.test(error);
}

/**
 * Stores a lead. The id is generated here and the insert ignores a duplicate
 * id, so a retry after a dropped connection can never store the lead twice.
 */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const now = new Date();
  const base = {
    id: crypto.randomUUID(),
    source: input.source,
    name: input.name || null,
    email: input.email || null,
    phone: input.phone || null,
    payload: input.payload || {},
    status: "new",
    created_at: now.toISOString(),
  };
  const insert = (row: Record<string, unknown>) =>
    supabaseInsert<Omit<Lead, "tracked">>("leads", row, {
      onConflict: "id",
      prefer: "return=representation,resolution=ignore-duplicates",
      idempotent: true,
    });

  let tracked = true;
  let { data, error } = await insert({
    ...base,
    notification_status: "pending",
    notification_next_attempt_at: new Date(now.getTime() + FIRST_ATTEMPT_GRACE_MS).toISOString(),
  });
  if (error && isMissingColumn(error)) {
    tracked = false;
    ({ data, error } = await insert(base));
  }
  if (error) {
    throw new Error(`Failed to create lead: ${error}`);
  }

  // An empty result means a retried insert found the row already stored.
  return { notified_at: null, ...base, ...(data?.[0] ?? {}), tracked };
}
