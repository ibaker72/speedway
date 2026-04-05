import { supabaseInsert } from "@/lib/supabase";

interface CreateLeadInput {
  source: string;
  name?: string;
  email?: string;
  phone?: string;
  payload?: Record<string, unknown>;
}

interface Lead {
  id: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
  notified_at: string | null;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const row = {
    source: input.source,
    name: input.name || null,
    email: input.email || null,
    phone: input.phone || null,
    payload: input.payload || {},
    status: "new",
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseInsert<Lead>("leads", row);

  if (error) {
    throw new Error(`Failed to create lead: ${error}`);
  }

  return data![0];
}
