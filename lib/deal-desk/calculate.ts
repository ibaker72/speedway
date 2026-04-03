import { DEAL_DESK_CONFIG } from "@/lib/deal-desk-config";
import type { DealCalculatorInput, DealCalculatorResult } from "@/lib/deal-desk/types";

const clampCurrency = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export function calculateDealEstimate(input: DealCalculatorInput): DealCalculatorResult {
  const vehiclePrice = clampCurrency(input.vehiclePrice);
  const downPayment = clampCurrency(input.downPayment);
  const tradeInValue = clampCurrency(input.tradeInValue);
  const tradePayoff = clampCurrency(input.tradePayoff);
  const termMonths = Math.max(1, Math.round(input.termMonths || DEAL_DESK_CONFIG.defaultTerm));
  const apr = Math.max(0, input.apr);

  const netTrade = tradeInValue - tradePayoff;
  const taxableBaseBeforeTrade = input.taxableIncludesFees
    ? vehiclePrice + clampCurrency(input.docFee) + clampCurrency(input.titleAndRegistrationFee || 0)
    : vehiclePrice;

  const taxableBase = Math.max(
    0,
    input.tradeReducesTaxableBase === false
      ? taxableBaseBeforeTrade
      : taxableBaseBeforeTrade - Math.max(0, netTrade),
  );

  const estimatedTaxes = taxableBase * Math.max(0, input.taxRate || 0);
  const estimatedFeesTotal =
    clampCurrency(input.docFee) +
    clampCurrency(input.titleAndRegistrationFee || 0) +
    clampCurrency(input.accessoriesFee || 0);

  const estimatedOutTheDoor = vehiclePrice + estimatedTaxes + estimatedFeesTotal - Math.max(0, netTrade);
  const amountFinanced = Math.max(0, estimatedOutTheDoor - downPayment + Math.max(0, -netTrade));

  let estimatedMonthlyPayment = 0;
  if (apr === 0) {
    estimatedMonthlyPayment = amountFinanced / termMonths;
  } else {
    const monthlyRate = apr / 12;
    estimatedMonthlyPayment =
      (amountFinanced * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -termMonths));
  }

  const estimatedTotalOfPayments = estimatedMonthlyPayment * termMonths;

  return {
    netTrade,
    taxableBase,
    estimatedTaxes,
    estimatedFeesTotal,
    amountFinanced,
    estimatedMonthlyPayment,
    estimatedTotalOfPayments,
    estimatedOutTheDoor,
    outTheDoorRange: {
      min: Math.max(0, estimatedOutTheDoor * 0.98),
      max: estimatedOutTheDoor * 1.05,
    },
  };
}
