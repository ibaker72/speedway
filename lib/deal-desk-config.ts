export type CreditTier = "excellent" | "good" | "fair" | "rebuilding";

export const DEAL_DESK_CONFIG = {
  aprByCreditTier: {
    excellent: 0.059,
    good: 0.079,
    fair: 0.119,
    rebuilding: 0.169,
  } as Record<CreditTier, number>,
  feeAssumptions: {
    docFee: 499,
    titleAndRegistrationFee: 350,
    accessoriesDefault: 0,
  },
  taxAssumptions: {
    taxRate: 0.06625,
    taxableIncludesFees: false,
    tradeReducesTaxableBase: true,
  },
  termOptions: [36, 48, 60, 72, 84],
  defaultTerm: 72,
  ctaLabels: {
    saveDeal: "Save This Deal",
    testDrive: "Book Test Drive",
    walkaround: "Request Video Walkaround",
    help: "Get Help From Sales",
  },
  disclaimer:
    "Estimated payment and out-the-door figures are informational only and not a financing offer. Final terms, taxes, fees, and approvals are determined by lender and dealership review.",
} as const;
