import type { DealDeskEvent, LeadTemperature } from "@/lib/deal-desk/types";

const EVENT_WEIGHTS: Record<DealDeskEvent["type"], number> = {
  deal_builder_opened: 8,
  deal_value_changed: 2,
  trade_in_used: 10,
  save_deal_clicked: 20,
  test_drive_requested: 30,
  walkaround_requested: 20,
  contact_submitted: 25,
};

export function computeLeadScore(events: DealDeskEvent[]) {
  const score = events.reduce((total, event) => total + EVENT_WEIGHTS[event.type], 0);
  let label: LeadTemperature = "Cold";
  if (score >= 60) label = "Hot";
  else if (score >= 25) label = "Warm";
  return { score, label };
}
