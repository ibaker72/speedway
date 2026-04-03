import type { CreditTier } from "@/lib/deal-desk-config";

export type DealDeskRequestType = "save_deal" | "test_drive" | "walkaround" | "help";
export type ContactPreference = "phone" | "email" | "text";
export type LeadStatus = "new" | "contacted" | "appointment_booked" | "sold" | "lost";
export type LeadTemperature = "Cold" | "Warm" | "Hot";

export interface DealCalculatorInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  tradePayoff: number;
  apr: number;
  termMonths: number;
  taxRate: number;
  docFee: number;
  titleAndRegistrationFee?: number;
  accessoriesFee?: number;
  taxableIncludesFees?: boolean;
  tradeReducesTaxableBase?: boolean;
}

export interface DealCalculatorResult {
  netTrade: number;
  taxableBase: number;
  estimatedTaxes: number;
  estimatedFeesTotal: number;
  amountFinanced: number;
  estimatedMonthlyPayment: number;
  estimatedTotalOfPayments: number;
  estimatedOutTheDoor: number;
  outTheDoorRange: { min: number; max: number };
}

export interface DealSnapshot {
  downPayment: number;
  termMonths: number;
  creditTier: CreditTier;
  tradeInValue: number;
  tradePayoff: number;
  result: DealCalculatorResult;
}

export interface DealDeskEvent {
  id: string;
  type:
    | "deal_builder_opened"
    | "deal_value_changed"
    | "trade_in_used"
    | "save_deal_clicked"
    | "test_drive_requested"
    | "walkaround_requested"
    | "contact_submitted";
  leadId?: string;
  vehicleId?: string;
  vehicleSlug?: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DealDeskLead {
  id: string;
  requestType: DealDeskRequestType;
  status: LeadStatus;
  followUpPriority: number;
  assignedRep?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    preferredContactMethod: ContactPreference;
    message?: string;
  };
  vehicle: {
    id: string;
    slug: string;
    stockNumber?: string;
    title: string;
    price: number;
  };
  calculatorSnapshot: DealSnapshot;
  monthlyEstimateShown: number;
  outTheDoorEstimateShown: number;
  engagementScore: number;
  engagementLabel: LeadTemperature;
  utm: Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string>>;
  referralSource?: string;
  sessionId: string;
  history: Array<{ type: string; at: string; note?: string }>;
  notes: Array<{ id: string; note: string; author?: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}
