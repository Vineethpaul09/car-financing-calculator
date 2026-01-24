import type { BCTaxes } from "../types";
import { roundCurrency } from "./calculations";

// BC Tax Constants
const GST_RATE = 0.05; // 5% Federal GST

// BC PST Tiers (Luxury Surtax)
const PST_TIERS = [
  { maxPrice: 55000, rate: 0.07 }, // 7% for vehicles up to $55,000
  { maxPrice: 56000, rate: 0.08 }, // 8% for $55,001 - $56,000
  { maxPrice: 57000, rate: 0.09 }, // 9% for $56,001 - $57,000
  { maxPrice: 125000, rate: 0.1 }, // 10% for $57,001 - $125,000
  { maxPrice: 150000, rate: 0.15 }, // 15% for $125,001 - $150,000
  { maxPrice: Infinity, rate: 0.2 }, // 20% for over $150,000
];

/**
 * Calculate BC PST rate based on vehicle price
 * Uses tiered luxury surtax system
 */
export function getBCPSTRate(vehiclePrice: number): number {
  for (const tier of PST_TIERS) {
    if (vehiclePrice <= tier.maxPrice) {
      return tier.rate;
    }
  }
  return PST_TIERS[PST_TIERS.length - 1].rate;
}

/**
 * Calculate all BC taxes for a vehicle purchase
 */
export function calculateBCTaxes(
  vehiclePrice: number,
  isNewVehicle: boolean,
): BCTaxes {
  // GST only applies to new vehicles purchased from dealers
  const gst = isNewVehicle ? roundCurrency(vehiclePrice * GST_RATE) : 0;

  // PST applies to all vehicles based on price tiers
  const pstRate = getBCPSTRate(vehiclePrice);
  const pst = roundCurrency(vehiclePrice * pstRate);

  const totalTax = roundCurrency(gst + pst);
  const priceWithTax = roundCurrency(vehiclePrice + totalTax);

  return {
    gst,
    pst,
    totalTax,
    priceWithTax,
  };
}

/**
 * Get PST tier description for display
 */
export function getPSTTierDescription(vehiclePrice: number): string {
  const rate = getBCPSTRate(vehiclePrice);
  const percentage = (rate * 100).toFixed(0);

  if (vehiclePrice <= 55000) {
    return `Standard PST (${percentage}%)`;
  } else if (vehiclePrice <= 57000) {
    return `Luxury Surtax Tier 1 (${percentage}%)`;
  } else if (vehiclePrice <= 125000) {
    return `Luxury Surtax Tier 2 (${percentage}%)`;
  } else if (vehiclePrice <= 150000) {
    return `Luxury Surtax Tier 3 (${percentage}%)`;
  } else {
    return `Maximum Luxury Surtax (${percentage}%)`;
  }
}

/**
 * Calculate total out-the-door price including all taxes
 */
export function calculateOutTheDoorPrice(
  vehiclePrice: number,
  isNewVehicle: boolean,
  additionalFees: number = 0,
): number {
  const taxes = calculateBCTaxes(vehiclePrice, isNewVehicle);
  return roundCurrency(taxes.priceWithTax + additionalFees);
}
