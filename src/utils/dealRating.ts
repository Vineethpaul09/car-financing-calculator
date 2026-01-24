import type {
  LoanInput,
  DealAnalysis,
  DealRating,
  Rule2410Result,
  RateQuality,
  CreditTier,
} from "../types";
import { calculateEnergyCosts, calculateLoanSummary } from "./calculations";

// ============================================
// CREDIT TIER DEFINITIONS
// ============================================

export const CREDIT_TIERS: CreditTier[] = [
  {
    name: "Excellent",
    scoreRange: "760+",
    newRateRange: { min: 4.99, max: 6.99 },
    usedRateRange: { min: 6.49, max: 8.49 },
  },
  {
    name: "Good",
    scoreRange: "700-759",
    newRateRange: { min: 6.99, max: 8.99 },
    usedRateRange: { min: 8.49, max: 11.99 },
  },
  {
    name: "Fair",
    scoreRange: "650-699",
    newRateRange: { min: 8.99, max: 12.99 },
    usedRateRange: { min: 11.99, max: 16.99 },
  },
  {
    name: "Poor",
    scoreRange: "Below 650",
    newRateRange: { min: 12.99, max: 24.99 },
    usedRateRange: { min: 16.99, max: 29.99 },
  },
];

// Good rate thresholds
const GOOD_RATE_THRESHOLDS = {
  new: { excellent: 5.99, good: 7.99, average: 10.99, poor: 14.99 },
  used: { excellent: 7.49, good: 9.99, average: 13.99, poor: 19.99 },
};

// ============================================
// 20/4/10 RULE CHECKER
// ============================================

/**
 * Check if the deal follows the 20/4/10 rule:
 * - 20% down payment minimum
 * - 4-year (48 month) maximum loan term
 * - 10% or less of gross monthly income for total car costs
 */
export function check2410Rule(input: LoanInput): Rule2410Result {
  const downPaymentPercent = (input.downPayment / input.vehiclePrice) * 100;
  const downPaymentPassed = downPaymentPercent >= 20;
  const termPassed = input.termMonths <= 48;

  let affordabilityPassed = true;
  let carCostPercent: number | undefined;

  if (input.monthlyIncome && input.monthlyIncome > 0) {
    const summary = calculateLoanSummary(input);
    const energy = calculateEnergyCosts(input);
    const totalMonthlyCost =
      summary.monthlyPayment +
      (input.monthlyInsurance || 0) +
      energy.monthlyEnergyCost;
    carCostPercent = (totalMonthlyCost / input.monthlyIncome) * 100;
    affordabilityPassed = carCostPercent <= 10;
  }

  return {
    downPaymentPassed,
    termPassed,
    affordabilityPassed,
    downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
    termMonths: input.termMonths,
    carCostPercent: carCostPercent
      ? Math.round(carCostPercent * 10) / 10
      : undefined,
  };
}

// ============================================
// RATE QUALITY ASSESSMENT
// ============================================

/**
 * Assess the quality of the interest rate
 */
export function assessRateQuality(
  annualRate: number,
  isNewVehicle: boolean,
): RateQuality {
  const thresholds = isNewVehicle
    ? GOOD_RATE_THRESHOLDS.new
    : GOOD_RATE_THRESHOLDS.used;
  const tierAverage = isNewVehicle ? 7.0 : 9.0; // Average good credit rate

  let quality: RateQuality["quality"];

  if (annualRate <= thresholds.excellent) {
    quality = "excellent";
  } else if (annualRate <= thresholds.good) {
    quality = "good";
  } else if (annualRate <= thresholds.average) {
    quality = "average";
  } else if (annualRate <= thresholds.poor) {
    quality = "poor";
  } else {
    quality = "predatory";
  }

  return {
    quality,
    tierAverage,
    difference: Math.round((annualRate - tierAverage) * 100) / 100,
  };
}

// ============================================
// COMPREHENSIVE DEAL ANALYSIS
// ============================================

/**
 * Perform comprehensive deal analysis
 */
export function analyzeDeal(input: LoanInput): DealAnalysis {
  const summary = calculateLoanSummary(input);
  const rule2410 = check2410Rule(input);
  const rateQuality = assessRateQuality(input.annualRate, input.isNewVehicle);

  // Calculate LTV ratio
  const ltvRatio =
    summary.loanAmount > 0
      ? (summary.loanAmount / input.vehiclePrice) * 100
      : 0;

  // Calculate DTI ratio if income provided
  let dtiRatio: number | undefined;
  if (input.monthlyIncome && input.monthlyIncome > 0) {
    dtiRatio = (summary.monthlyPayment / input.monthlyIncome) * 100;
  }

  // Calculate interest percentage of principal
  const interestPercent =
    summary.loanAmount > 0
      ? (summary.totalInterest / summary.loanAmount) * 100
      : 0;

  // Build analysis
  const reasons: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Rate quality scoring
  switch (rateQuality.quality) {
    case "excellent":
      reasons.push(`Excellent interest rate of ${input.annualRate}%`);
      break;
    case "good":
      reasons.push(`Good interest rate of ${input.annualRate}%`);
      score -= 5;
      break;
    case "average":
      warnings.push(
        `Average interest rate of ${input.annualRate}% - you may be able to negotiate lower`,
      );
      score -= 15;
      recommendations.push(
        "Get pre-approved from a bank or credit union to compare rates",
      );
      break;
    case "poor":
      warnings.push(
        `High interest rate of ${input.annualRate}% - significantly above average`,
      );
      score -= 30;
      recommendations.push(
        "Consider improving your credit score before financing",
      );
      recommendations.push("Shop around for better rates at credit unions");
      break;
    case "predatory":
      warnings.push(
        `⚠️ PREDATORY interest rate of ${input.annualRate}% - strongly consider alternatives`,
      );
      score -= 50;
      recommendations.push("DO NOT sign at this rate - explore other options");
      recommendations.push("Consider buying a less expensive vehicle");
      break;
  }

  // 20/4/10 Rule scoring
  if (rule2410.downPaymentPassed) {
    reasons.push(
      `Strong down payment of ${rule2410.downPaymentPercent}% (meets 20% rule)`,
    );
  } else {
    warnings.push(
      `Down payment of ${rule2410.downPaymentPercent}% is below recommended 20%`,
    );
    score -= 10;
    recommendations.push(
      "Consider saving for a larger down payment to reduce negative equity risk",
    );
  }

  if (rule2410.termPassed) {
    reasons.push(
      `Smart loan term of ${rule2410.termMonths} months (≤48 months recommended)`,
    );
  } else if (input.termMonths <= 60) {
    warnings.push(
      `Loan term of ${rule2410.termMonths} months is acceptable but longer than ideal`,
    );
    score -= 5;
  } else if (input.termMonths <= 72) {
    warnings.push(
      `Loan term of ${rule2410.termMonths} months is long - higher total interest`,
    );
    score -= 15;
    recommendations.push("Consider a shorter term to save on interest");
  } else {
    warnings.push(
      `⚠️ Loan term of ${rule2410.termMonths} months is very long - significant depreciation risk`,
    );
    score -= 25;
    recommendations.push(
      "Strongly consider a shorter term or less expensive vehicle",
    );
  }

  if (rule2410.carCostPercent !== undefined) {
    if (rule2410.affordabilityPassed) {
      reasons.push(
        `Car costs are ${rule2410.carCostPercent}% of income (under 10% guideline)`,
      );
    } else if (rule2410.carCostPercent <= 15) {
      warnings.push(
        `Car costs are ${rule2410.carCostPercent}% of income (above 10% guideline)`,
      );
      score -= 10;
    } else {
      warnings.push(
        `⚠️ Car costs are ${rule2410.carCostPercent}% of income - may strain your budget`,
      );
      score -= 20;
      recommendations.push(
        "Consider a less expensive vehicle to stay within budget",
      );
    }
  }

  // LTV scoring
  if (ltvRatio <= 80) {
    reasons.push(`Healthy loan-to-value ratio of ${Math.round(ltvRatio)}%`);
  } else if (ltvRatio <= 100) {
    // Acceptable, no warning
  } else {
    warnings.push(
      `High loan-to-value ratio of ${Math.round(ltvRatio)}% - negative equity risk`,
    );
    score -= 10;
  }

  // Interest percentage scoring
  if (interestPercent <= 10) {
    reasons.push(
      `Low total interest of ${Math.round(interestPercent)}% of loan amount`,
    );
  } else if (interestPercent <= 20) {
    // Acceptable
  } else if (interestPercent <= 30) {
    warnings.push(
      `You'll pay ${Math.round(interestPercent)}% in interest on top of the loan`,
    );
    score -= 5;
  } else {
    warnings.push(
      `⚠️ Very high interest cost - ${Math.round(interestPercent)}% of the loan amount`,
    );
    score -= 15;
  }

  // Determine overall rating
  let rating: DealRating;
  if (score >= 85) {
    rating = "excellent";
  } else if (score >= 70) {
    rating = "good";
  } else if (score >= 50) {
    rating = "fair";
  } else {
    rating = "bad";
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    rating,
    score,
    reasons,
    warnings,
    recommendations,
    rule2410,
    rateQuality,
    ltvRatio: Math.round(ltvRatio),
    dtiRatio: dtiRatio ? Math.round(dtiRatio * 10) / 10 : undefined,
  };
}

/**
 * Get rating color based on deal rating
 */
export function getRatingColor(rating: DealRating): string {
  switch (rating) {
    case "excellent":
      return "#22c55e"; // Green
    case "good":
      return "#84cc16"; // Lime
    case "fair":
      return "#eab308"; // Yellow
    case "bad":
      return "#ef4444"; // Red
  }
}

/**
 * Get rating emoji based on deal rating
 */
export function getRatingEmoji(rating: DealRating): string {
  switch (rating) {
    case "excellent":
      return "✅";
    case "good":
      return "👍";
    case "fair":
      return "⚠️";
    case "bad":
      return "🚫";
  }
}

/**
 * Get rating label based on deal rating
 */
export function getRatingLabel(rating: DealRating): string {
  switch (rating) {
    case "excellent":
      return "EXCELLENT DEAL";
    case "good":
      return "GOOD DEAL";
    case "fair":
      return "FAIR DEAL";
    case "bad":
      return "BAD DEAL";
  }
}
