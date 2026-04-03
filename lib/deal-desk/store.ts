import { promises as fs } from "fs";
import path from "path";
import type { DealDeskEvent, DealDeskLead, LeadStatus } from "@/lib/deal-desk/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_PATH = path.join(DATA_DIR, "deal-desk.json");

type DealDeskDB = {
  leads: DealDeskLead[];
  events: DealDeskEvent[];
};

const initialDb: DealDeskDB = { leads: [], events: [] };

async function ensureDbFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(initialDb, null, 2), "utf8");
  }
}

async function readDb(): Promise<DealDeskDB> {
  await ensureDbFile();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as DealDeskDB;
}

async function writeDb(db: DealDeskDB) {
  await fs.writeFile(DATA_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function createLead(lead: DealDeskLead) {
  const db = await readDb();
  db.leads.unshift(lead);
  await writeDb(db);
  return lead;
}

export async function listLeads() {
  const db = await readDb();
  return db.leads;
}

export async function getLeadById(id: string) {
  const db = await readDb();
  return db.leads.find((lead) => lead.id === id) || null;
}

export async function updateLead(id: string, updates: Partial<Pick<DealDeskLead, "status" | "assignedRep" | "followUpPriority">>) {
  const db = await readDb();
  const lead = db.leads.find((item) => item.id === id);
  if (!lead) return null;
  if (updates.status) {
    lead.status = updates.status as LeadStatus;
    lead.history.unshift({ type: `status_${updates.status}`, at: new Date().toISOString() });
  }
  if (typeof updates.assignedRep === "string") lead.assignedRep = updates.assignedRep;
  if (typeof updates.followUpPriority === "number") lead.followUpPriority = updates.followUpPriority;
  lead.updatedAt = new Date().toISOString();
  await writeDb(db);
  return lead;
}

export async function addLeadNote(leadId: string, note: { id: string; note: string; author?: string; createdAt: string }) {
  const db = await readDb();
  const lead = db.leads.find((item) => item.id === leadId);
  if (!lead) return null;
  lead.notes.unshift(note);
  lead.history.unshift({ type: "note_added", at: note.createdAt, note: note.note });
  lead.updatedAt = new Date().toISOString();
  await writeDb(db);
  return lead;
}

export async function createEvent(event: DealDeskEvent) {
  const db = await readDb();
  db.events.unshift(event);
  await writeDb(db);
  return event;
}

export async function listEventsBySession(sessionId: string, vehicleId?: string) {
  const db = await readDb();
  return db.events.filter((event) => event.sessionId === sessionId && (!vehicleId || event.vehicleId === vehicleId));
}
