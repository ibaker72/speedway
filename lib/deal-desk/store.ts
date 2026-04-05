import type { DealDeskEvent, DealDeskLead, LeadStatus } from "@/lib/deal-desk/types";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured for deal-desk");
  return { url, key };
}

function headers(key: string, prefer?: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function leadToRow(lead: DealDeskLead) {
  return {
    id: lead.id,
    request_type: lead.requestType,
    status: lead.status,
    follow_up_priority: lead.followUpPriority,
    assigned_rep: lead.assignedRep || null,
    customer_name: lead.customer.name,
    customer_phone: lead.customer.phone,
    customer_email: lead.customer.email,
    preferred_contact_method: lead.customer.preferredContactMethod,
    customer_message: lead.customer.message || null,
    vehicle_id: lead.vehicle.id,
    vehicle_slug: lead.vehicle.slug,
    stock_number: lead.vehicle.stockNumber || null,
    vehicle_title: lead.vehicle.title,
    vehicle_price: lead.vehicle.price,
    calculator_snapshot: lead.calculatorSnapshot,
    monthly_estimate_shown: lead.monthlyEstimateShown,
    out_the_door_estimate_shown: lead.outTheDoorEstimateShown,
    engagement_score: lead.engagementScore,
    engagement_label: lead.engagementLabel,
    utm: lead.utm,
    referral_source: lead.referralSource || null,
    session_id: lead.sessionId,
    history: lead.history,
    notes: lead.notes,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

function rowToLead(row: Record<string, unknown>): DealDeskLead {
  return {
    id: String(row.id),
    requestType: row.request_type as DealDeskLead["requestType"],
    status: row.status as LeadStatus,
    followUpPriority: Number(row.follow_up_priority),
    assignedRep: row.assigned_rep ? String(row.assigned_rep) : undefined,
    customer: {
      name: String(row.customer_name),
      phone: String(row.customer_phone),
      email: String(row.customer_email),
      preferredContactMethod: row.preferred_contact_method as DealDeskLead["customer"]["preferredContactMethod"],
      message: row.customer_message ? String(row.customer_message) : undefined,
    },
    vehicle: {
      id: String(row.vehicle_id),
      slug: String(row.vehicle_slug),
      stockNumber: row.stock_number ? String(row.stock_number) : undefined,
      title: String(row.vehicle_title),
      price: Number(row.vehicle_price),
    },
    calculatorSnapshot: row.calculator_snapshot as DealDeskLead["calculatorSnapshot"],
    monthlyEstimateShown: Number(row.monthly_estimate_shown),
    outTheDoorEstimateShown: Number(row.out_the_door_estimate_shown),
    engagementScore: Number(row.engagement_score),
    engagementLabel: row.engagement_label as DealDeskLead["engagementLabel"],
    utm: (row.utm || {}) as DealDeskLead["utm"],
    referralSource: row.referral_source ? String(row.referral_source) : undefined,
    sessionId: String(row.session_id),
    history: (row.history || []) as DealDeskLead["history"],
    notes: (row.notes || []) as DealDeskLead["notes"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function createLead(lead: DealDeskLead) {
  const { url, key } = getConfig();
  const row = leadToRow(lead);

  const res = await fetch(`${url}/rest/v1/deal_desk_leads`, {
    method: "POST",
    headers: headers(key, "return=representation"),
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create deal-desk lead: ${text}`);
  }

  const [created] = (await res.json()) as Record<string, unknown>[];
  return rowToLead(created);
}

export async function listLeads() {
  const { url, key } = getConfig();

  const res = await fetch(`${url}/rest/v1/deal_desk_leads?select=*&order=created_at.desc`, {
    headers: headers(key),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list deal-desk leads: ${text}`);
  }

  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.map(rowToLead);
}

export async function getLeadById(id: string) {
  const { url, key } = getConfig();

  const res = await fetch(`${url}/rest/v1/deal_desk_leads?id=eq.${id}&select=*`, {
    headers: headers(key),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get deal-desk lead: ${text}`);
  }

  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.length > 0 ? rowToLead(rows[0]) : null;
}

export async function updateLead(id: string, updates: Partial<Pick<DealDeskLead, "status" | "assignedRep" | "followUpPriority">>) {
  const { url, key } = getConfig();

  const existing = await getLeadById(id);
  if (!existing) return null;

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status) {
    patch.status = updates.status;
    const newHistory = [...existing.history];
    newHistory.unshift({ type: `status_${updates.status}`, at: new Date().toISOString() });
    patch.history = newHistory;
  }
  if (typeof updates.assignedRep === "string") patch.assigned_rep = updates.assignedRep;
  if (typeof updates.followUpPriority === "number") patch.follow_up_priority = updates.followUpPriority;

  const res = await fetch(`${url}/rest/v1/deal_desk_leads?id=eq.${id}`, {
    method: "PATCH",
    headers: headers(key, "return=representation"),
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update deal-desk lead: ${text}`);
  }

  const [updated] = (await res.json()) as Record<string, unknown>[];
  return rowToLead(updated);
}

export async function addLeadNote(leadId: string, note: { id: string; note: string; author?: string; createdAt: string }) {
  const { url, key } = getConfig();

  const existing = await getLeadById(leadId);
  if (!existing) return null;

  const newNotes = [...existing.notes];
  newNotes.unshift(note);
  const newHistory = [...existing.history];
  newHistory.unshift({ type: "note_added", at: note.createdAt, note: note.note });

  const res = await fetch(`${url}/rest/v1/deal_desk_leads?id=eq.${leadId}`, {
    method: "PATCH",
    headers: headers(key, "return=representation"),
    body: JSON.stringify({
      notes: newNotes,
      history: newHistory,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to add note to deal-desk lead: ${text}`);
  }

  const [updated] = (await res.json()) as Record<string, unknown>[];
  return rowToLead(updated);
}

export async function createEvent(event: DealDeskEvent) {
  const { url, key } = getConfig();

  const row = {
    id: event.id,
    type: event.type,
    lead_id: event.leadId || null,
    vehicle_id: event.vehicleId || null,
    vehicle_slug: event.vehicleSlug || null,
    session_id: event.sessionId,
    metadata: event.metadata || null,
    created_at: event.createdAt,
  };

  const res = await fetch(`${url}/rest/v1/deal_desk_events`, {
    method: "POST",
    headers: headers(key, "return=representation"),
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create deal-desk event: ${text}`);
  }

  const [created] = (await res.json()) as Record<string, unknown>[];
  return {
    id: String(created.id),
    type: created.type as DealDeskEvent["type"],
    leadId: created.lead_id ? String(created.lead_id) : undefined,
    vehicleId: created.vehicle_id ? String(created.vehicle_id) : undefined,
    vehicleSlug: created.vehicle_slug ? String(created.vehicle_slug) : undefined,
    sessionId: String(created.session_id),
    metadata: (created.metadata || undefined) as DealDeskEvent["metadata"],
    createdAt: String(created.created_at),
  } as DealDeskEvent;
}

export async function listEventsBySession(sessionId: string, vehicleId?: string) {
  const { url, key } = getConfig();

  let qs = `session_id=eq.${sessionId}&order=created_at.desc`;
  if (vehicleId) qs += `&vehicle_id=eq.${vehicleId}`;

  const res = await fetch(`${url}/rest/v1/deal_desk_events?${qs}`, {
    headers: headers(key),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list deal-desk events: ${text}`);
  }

  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    type: r.type as DealDeskEvent["type"],
    leadId: r.lead_id ? String(r.lead_id) : undefined,
    vehicleId: r.vehicle_id ? String(r.vehicle_id) : undefined,
    vehicleSlug: r.vehicle_slug ? String(r.vehicle_slug) : undefined,
    sessionId: String(r.session_id),
    metadata: (r.metadata || undefined) as DealDeskEvent["metadata"],
    createdAt: String(r.created_at),
  })) as DealDeskEvent[];
}
