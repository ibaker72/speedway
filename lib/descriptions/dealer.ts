import { dealerConfig } from "@/dealer.config";
import type { DealerContext } from "@/lib/descriptions/facts";

export function dealerDescriptionContext(): DealerContext {
  const location = dealerConfig.locations[0];
  return {
    name: dealerConfig.shortName,
    city: location.city,
    state: location.state,
    shipping: dealerConfig.features.nationwideShipping,
  };
}
