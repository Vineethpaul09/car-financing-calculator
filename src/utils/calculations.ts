import type {
  LoanInput,
  LoanSummary,
  MonthlyBreakdown,
  BiWeeklyComparison,
  // Weekly comparison uses same shape as bi-weekly; kept inline to avoid extra type
  EarlyPayoffResult,
  TermComparison,
  TotalCostOfOwnership,
  DepreciationForecast,
  EnergyCostResult,
  LeaseInput,
  LeaseCalculation,
  LeaseVsBuyComparison,
  LeaseAnalysis,
} from "../types";

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${roundToDecimals(value, 2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-CA").format(Math.round(value));
}

// ============================================
// ENERGY & FUEL COSTS
// ============================================

export function calculateEnergyCosts(input: LoanInput): EnergyCostResult {
  const annualMileage = input.estimatedMileagePerYear ?? 20000; // km
  const drivetrain = input.drivetrain ?? "gas";

  const fuelEfficiency = input.fuelEfficiencyLPer100km ?? 8.5; // L/100km
  const electricEfficiency = input.electricEfficiencyKWhPer100km ?? 19; // kWh/100km
  const gasPrice = input.gasPricePerL ?? 1.85; // $/L
  const electricityPrice = input.electricityPricePerKWh ?? 0.15; // $/kWh
  const phevElectricShare = Math.min(
    Math.max(input.phevElectricShare ?? 60, 0),
    100,
  );

  let annualLitersUsed = 0;
  let annualKWhUsed = 0;

  switch (drivetrain) {
    case "ev": {
      annualKWhUsed = (annualMileage / 100) * electricEfficiency;
      break;
    }
    case "phev": {
      const electricKm = (annualMileage * phevElectricShare) / 100;
      const gasKm = annualMileage - electricKm;
      annualKWhUsed = (electricKm / 100) * electricEfficiency;
      annualLitersUsed = (gasKm / 100) * fuelEfficiency;
      break;
    }
    case "hybrid":
    case "gas":
    default: {
      annualLitersUsed = (annualMileage / 100) * fuelEfficiency;
      break;
    }
  }

  const annualGasCost = roundCurrency(annualLitersUsed * gasPrice);
  const annualElectricCost = roundCurrency(annualKWhUsed * electricityPrice);
  const annualEnergyCost = roundCurrency(annualGasCost + annualElectricCost);

  const derivedMonthly = roundCurrency(annualEnergyCost / 12);
  const monthlyEnergyCost =
    input.monthlyFuel !== undefined && Number.isFinite(input.monthlyFuel)
      ? input.monthlyFuel
      : derivedMonthly;

  const perKmEnergyCost =
    annualMileage > 0
      ? roundToDecimals(annualEnergyCost / annualMileage, 4)
      : 0;

  return {
    annualGasCost,
    annualElectricCost,
    annualEnergyCost,
    monthlyEnergyCost,
    perKmEnergyCost,
    annualLitersUsed: roundToDecimals(annualLitersUsed, 2),
    annualKWhUsed: roundToDecimals(annualKWhUsed, 2),
  };
}

// ============================================
// TRADE-IN CALCULATIONS
// ============================================

export function calculateNetTradeIn(
  tradeInValue: number = 0,
  tradeInAmountOwed: number = 0,
): number {
  const netTradeIn = tradeInValue - tradeInAmountOwed;
  return netTradeIn; // Can be negative (underwater)
}

export function calculateAmountFinanced(
  vehiclePrice: number,
  downPayment: number,
  tradeInValue: number = 0,
  tradeInAmountOwed: number = 0,
  cashIncentives: number = 0,
): number {
  const netTradeIn = calculateNetTradeIn(tradeInValue, tradeInAmountOwed);
  const amountFinanced =
    vehiclePrice - downPayment - netTradeIn - cashIncentives;
  return Math.max(0, amountFinanced);
}

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate monthly payment using standard amortization formula
 * PMT = P x [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  if (principal <= 0) return 0;

  // Handle 0% interest edge case
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 100 / 12;
  const compoundFactor = Math.pow(1 + monthlyRate, termMonths);

  const payment =
    (principal * (monthlyRate * compoundFactor)) / (compoundFactor - 1);

  return roundCurrency(payment);
}

/**
 * Calculate complete loan summary with trade-in support
 */
export function calculateLoanSummary(input: LoanInput): LoanSummary {
  const netTradeIn = calculateNetTradeIn(
    input.tradeInValue || 0,
    input.tradeInAmountOwed || 0,
  );

  const amountFinanced = calculateAmountFinanced(
    input.vehiclePrice,
    input.downPayment,
    input.tradeInValue,
    input.tradeInAmountOwed,
    input.cashIncentives,
  );

  if (amountFinanced <= 0) {
    return {
      loanAmount: 0,
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      effectiveRate: 0,
      interestToPrincipalRatio: 0,
      netTradeInCredit: netTradeIn,
      amountFinanced: 0,
    };
  }

  const monthlyPayment = calculateMonthlyPayment(
    amountFinanced,
    input.annualRate,
    input.termMonths,
  );

  const totalPayment = monthlyPayment * input.termMonths;
  const totalInterest = totalPayment - amountFinanced;
  const effectiveRate =
    amountFinanced > 0 ? (totalInterest / amountFinanced) * 100 : 0;
  const interestToPrincipalRatio =
    amountFinanced > 0 ? totalInterest / amountFinanced : 0;

  return {
    loanAmount: amountFinanced,
    monthlyPayment,
    totalPayment: roundCurrency(totalPayment),
    totalInterest: roundCurrency(totalInterest),
    effectiveRate: roundToDecimals(effectiveRate, 2),
    interestToPrincipalRatio: roundToDecimals(interestToPrincipalRatio, 4),
    netTradeInCredit: netTradeIn,
    amountFinanced,
  };
}

/**
 * Generate complete amortization schedule
 */
export function generateAmortizationSchedule(
  input: LoanInput,
): MonthlyBreakdown[] {
  const amountFinanced = calculateAmountFinanced(
    input.vehiclePrice,
    input.downPayment,
    input.tradeInValue,
    input.tradeInAmountOwed,
    input.cashIncentives,
  );

  if (amountFinanced <= 0) return [];

  const monthlyRate = input.annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(
    amountFinanced,
    input.annualRate,
    input.termMonths,
  );

  const schedule: MonthlyBreakdown[] = [];
  let balance = amountFinanced;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= input.termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    // Handle final payment rounding
    if (month === input.termMonths) {
      principalPayment = balance;
    }

    balance -= principalPayment;
    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;

    schedule.push({
      paymentNumber: month,
      payment: roundCurrency(principalPayment + interestPayment),
      principal: roundCurrency(principalPayment),
      interest: roundCurrency(interestPayment),
      balance: roundCurrency(Math.max(0, balance)),
      cumulativeInterest: roundCurrency(cumulativeInterest),
      cumulativePrincipal: roundCurrency(cumulativePrincipal),
    });
  }

  return schedule;
}

/**
 * Calculate early payoff with extra monthly payments
 */
export function calculateEarlyPayoff(
  input: LoanInput,
  extraMonthlyPayment: number,
): EarlyPayoffResult {
  const amountFinanced = calculateAmountFinanced(
    input.vehiclePrice,
    input.downPayment,
    input.tradeInValue,
    input.tradeInAmountOwed,
    input.cashIncentives,
  );

  if (amountFinanced <= 0) {
    return {
      newPayoffMonths: 0,
      interestSaved: 0,
      totalInterestPaid: 0,
      originalTotalInterest: 0,
    };
  }

  const monthlyRate = input.annualRate / 100 / 12;
  const basePayment = calculateMonthlyPayment(
    amountFinanced,
    input.annualRate,
    input.termMonths,
  );

  const totalPayment = basePayment + extraMonthlyPayment;

  let balance = amountFinanced;
  let months = 0;
  let totalInterestPaid = 0;

  while (balance > 0 && months < input.termMonths * 2) {
    months++;
    const interestPayment = balance * monthlyRate;
    totalInterestPaid += interestPayment;

    const principalPayment = Math.min(totalPayment - interestPayment, balance);
    balance -= principalPayment;
  }

  const originalSummary = calculateLoanSummary(input);

  return {
    newPayoffMonths: months,
    interestSaved: roundCurrency(
      originalSummary.totalInterest - totalInterestPaid,
    ),
    totalInterestPaid: roundCurrency(totalInterestPaid),
    originalTotalInterest: originalSummary.totalInterest,
  };
}

/**
 * Calculate bi-weekly payment benefits
 * Bi-weekly = 26 payments/year = equivalent to 13 monthly payments
 */
export function calculateBiWeeklyBenefits(
  input: LoanInput,
): BiWeeklyComparison {
  const amountFinanced = calculateAmountFinanced(
    input.vehiclePrice,
    input.downPayment,
    input.tradeInValue,
    input.tradeInAmountOwed,
    input.cashIncentives,
  );

  if (amountFinanced <= 0) {
    return {
      monthlyPayment: 0,
      biWeeklyPayment: 0,
      monthlyTotalInterest: 0,
      biWeeklyTotalInterest: 0,
      interestSaved: 0,
      monthsSaved: 0,
    };
  }

  const biWeeklyRate = input.annualRate / 100 / 26;

  const monthlyPayment = calculateMonthlyPayment(
    amountFinanced,
    input.annualRate,
    input.termMonths,
  );

  // Bi-weekly payment is half the monthly payment
  const biWeeklyPayment = monthlyPayment / 2;

  // Simulate bi-weekly payments
  let balance = amountFinanced;
  let biWeeklyInterest = 0;
  let payments = 0;
  const maxPayments = input.termMonths * 3; // Safety limit

  while (balance > 0 && payments < maxPayments) {
    payments++;
    const interest = balance * biWeeklyRate;
    biWeeklyInterest += interest;
    const principal = Math.min(biWeeklyPayment - interest, balance);
    balance -= principal;
  }

  const monthlyTotalInterest = calculateLoanSummary(input).totalInterest;

  return {
    monthlyPayment,
    biWeeklyPayment: roundCurrency(biWeeklyPayment),
    monthlyTotalInterest,
    biWeeklyTotalInterest: roundCurrency(biWeeklyInterest),
    interestSaved: roundCurrency(monthlyTotalInterest - biWeeklyInterest),
    monthsSaved: Math.round(input.termMonths - payments / 2.17),
  };
}

/**
 * Calculate weekly payment benefits
 * Weekly = 52 payments/year ~ 4.33 payments/month
 */
export function calculateWeeklyBenefits(input: LoanInput) {
  const amountFinanced = calculateAmountFinanced(
    input.vehiclePrice,
    input.downPayment,
    input.tradeInValue,
    input.tradeInAmountOwed,
    input.cashIncentives,
  );

  if (amountFinanced <= 0) {
    return {
      monthlyPayment: 0,
      weeklyPayment: 0,
      monthlyTotalInterest: 0,
      weeklyTotalInterest: 0,
      interestSaved: 0,
      monthsSaved: 0,
    };
  }

  const summary = calculateLoanSummary(input);
  const monthlyPayment = summary.monthlyPayment;
  const monthlyTotalInterest = summary.totalInterest;

  const weeklyRate = input.annualRate / 100 / 52;
  const weeklyPayment = monthlyPayment * (12 / 52);

  let balance = amountFinanced;
  let weeklyInterest = 0;
  let payments = 0;
  const maxPayments = Math.ceil(input.termMonths * 4.5 * 2); // safety bound

  while (balance > 0 && payments < maxPayments) {
    payments++;
    const interest = balance * weeklyRate;
    weeklyInterest += interest;
    const principal = Math.min(weeklyPayment - interest, balance);

    // Prevent infinite loop if payment is too small
    if (principal <= 0) break;

    balance -= principal;
  }

  const weeksPerMonth = 52 / 12;
  return {
    monthlyPayment,
    weeklyPayment: roundCurrency(weeklyPayment),
    monthlyTotalInterest,
    weeklyTotalInterest: roundCurrency(weeklyInterest),
    interestSaved: roundCurrency(monthlyTotalInterest - weeklyInterest),
    monthsSaved: Math.max(
      0,
      Math.round(input.termMonths - payments / weeksPerMonth),
    ),
  };
}

/**
 * Compare different loan terms
 */
export function compareLoanTerms(input: LoanInput): TermComparison[] {
  const terms = [24, 36, 48, 60, 72, 84];
  const comparisons: TermComparison[] = [];

  let bestValueIndex = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const summary = calculateLoanSummary({
      ...input,
      termMonths: term,
    });

    // Calculate rating (shorter terms get better ratings)
    let rating = 5;
    if (term > 48) rating = 4;
    if (term > 60) rating = 3;
    if (term > 72) rating = 2;
    if (term > 84) rating = 1;

    // Adjust rating based on interest percentage
    const interestPercent =
      summary.loanAmount > 0
        ? (summary.totalInterest / summary.loanAmount) * 100
        : 0;
    if (interestPercent > 20) rating = Math.max(1, rating - 1);
    if (interestPercent > 30) rating = Math.max(1, rating - 1);

    // Calculate value score (balance between payment and interest)
    const valueScore = rating * 20 - summary.totalInterest / 1000;
    if (valueScore > bestScore) {
      bestScore = valueScore;
      bestValueIndex = i;
    }

    comparisons.push({
      termMonths: term,
      monthlyPayment: summary.monthlyPayment,
      totalInterest: summary.totalInterest,
      totalCost: summary.totalPayment + input.downPayment,
      rating,
      isRecommended: false,
    });
  }

  // Mark best value
  if (comparisons.length > 0) {
    comparisons[bestValueIndex].isRecommended = true;
  }

  return comparisons;
}

// ============================================
// DEPRECIATION CALCULATIONS
// ============================================

/**
 * Calculate vehicle depreciation forecast
 * Standard depreciation: Year 1: 20%, Years 2-5: 15%/year
 */
export function calculateDepreciationForecast(
  vehiclePrice: number,
  isNew: boolean,
  years: number = 7,
): DepreciationForecast[] {
  const forecast: DepreciationForecast[] = [];
  let currentValue = vehiclePrice;
  let cumulativeDepreciation = 0;

  for (let year = 1; year <= years; year++) {
    let depreciationRate: number;

    if (isNew && year === 1) {
      depreciationRate = 0.2; // 20% first year depreciation for new cars
    } else if (year <= 3) {
      depreciationRate = 0.15; // 15% years 2-3
    } else if (year <= 5) {
      depreciationRate = 0.12; // 12% years 4-5
    } else {
      depreciationRate = 0.1; // 10% years 6+
    }

    // Used cars depreciate less in first year
    if (!isNew && year === 1) {
      depreciationRate = 0.15;
    }

    const depreciationAmount = currentValue * depreciationRate;
    currentValue -= depreciationAmount;
    cumulativeDepreciation += depreciationAmount;

    forecast.push({
      year,
      value: roundCurrency(currentValue),
      depreciationAmount: roundCurrency(depreciationAmount),
      cumulativeDepreciation: roundCurrency(cumulativeDepreciation),
      percentRetained: roundToDecimals((currentValue / vehiclePrice) * 100, 1),
    });
  }

  return forecast;
}

// ============================================
// TOTAL COST OF OWNERSHIP
// ============================================

/**
 * Calculate Total Cost of Ownership
 * Based on CAA/AAA averages for Canadian market
 */
export function calculateTotalCostOfOwnership(
  input: LoanInput,
  monthlyPayment: number,
): TotalCostOfOwnership {
  const termYears = input.termMonths / 12;
  const annualMileage = input.estimatedMileagePerYear || 20000; // km
  const monthlyMileage = annualMileage / 12;

  const energy = calculateEnergyCosts(input);
  const fuel = energy.monthlyEnergyCost;

  const maintenanceRatePerKm = (() => {
    switch (input.drivetrain) {
      case "ev":
        return 0.03;
      case "phev":
      case "hybrid":
        return 0.04;
      default:
        return 0.05;
    }
  })();

  // Monthly costs (CAA averages)
  const insurance = input.monthlyInsurance || 150; // $150/month average
  const maintenance = monthlyMileage * maintenanceRatePerKm;

  // Monthly depreciation estimate
  const depreciationForecast = calculateDepreciationForecast(
    input.vehiclePrice,
    input.isNewVehicle,
    Math.ceil(termYears),
  );

  const totalDepreciation =
    depreciationForecast.length > 0
      ? depreciationForecast[
          Math.min(Math.ceil(termYears) - 1, depreciationForecast.length - 1)
        ].cumulativeDepreciation
      : input.vehiclePrice * 0.5;

  const monthlyDepreciation = totalDepreciation / input.termMonths;

  const totalMonthly =
    monthlyPayment + insurance + fuel + maintenance + monthlyDepreciation;
  const totalAnnual = totalMonthly * 12;
  const totalOverTerm = totalMonthly * input.termMonths;

  const totalMiles = annualMileage * termYears;
  const perMileCost = totalOverTerm / totalMiles;

  return {
    monthlyPayment,
    insurance: roundCurrency(insurance),
    fuel: roundCurrency(fuel),
    maintenance: roundCurrency(maintenance),
    depreciation: roundCurrency(monthlyDepreciation),
    totalMonthly: roundCurrency(totalMonthly),
    totalAnnual: roundCurrency(totalAnnual),
    totalOverTerm: roundCurrency(totalOverTerm),
    perMileCost: roundToDecimals(perMileCost, 2),
    energy,
    maintenanceRatePerKm: roundToDecimals(maintenanceRatePerKm, 4),
    annualMileage,
  };
}

// ============================================
// AFFORDABILITY CALCULATIONS
// ============================================

/**
 * Calculate maximum affordable car price based on budget
 */
export function calculateMaxAffordablePrice(
  monthlyBudget: number,
  downPayment: number,
  annualRate: number,
  termMonths: number,
): number {
  if (monthlyBudget <= 0) return downPayment;

  // Reverse the payment formula: P = M  [(1+r)^n - 1] / [r(1+r)^n]
  const monthlyRate = annualRate / 100 / 12;
  const compoundFactor = Math.pow(1 + monthlyRate, termMonths);

  const maxLoanAmount =
    (monthlyBudget * (compoundFactor - 1)) / (monthlyRate * compoundFactor);

  return roundCurrency(maxLoanAmount + downPayment);
}

/**
 * Calculate DTI (Debt-to-Income) ratio
 */
export function calculateDTI(
  monthlyPayment: number,
  monthlyIncome: number,
): number {
  if (monthlyIncome <= 0) return 0;
  return roundToDecimals((monthlyPayment / monthlyIncome) * 100, 1);
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateLoanInput(input: LoanInput): ValidationResult {
  const errors: string[] = [];

  // Validate vehicle price
  if (input.vehiclePrice < 1000) {
    errors.push("Vehicle price must be at least $1,000");
  }
  if (input.vehiclePrice > 500000) {
    errors.push("Vehicle price cannot exceed $500,000");
  }
  if (!Number.isFinite(input.vehiclePrice) || input.vehiclePrice <= 0) {
    errors.push("Vehicle price must be a positive number");
  }

  // Validate down payment
  if (input.downPayment < 0) {
    errors.push("Down payment cannot be negative");
  }
  if (input.downPayment >= input.vehiclePrice) {
    errors.push("Down payment must be less than vehicle price");
  }

  // Validate interest rate
  if (input.annualRate < 0) {
    errors.push("Interest rate cannot be negative");
  }
  if (input.annualRate > 30) {
    errors.push("Interest rate cannot exceed 30%");
  }

  // Validate term
  if (input.termMonths < 12) {
    errors.push("Loan term must be at least 12 months");
  }
  if (input.termMonths > 96) {
    errors.push("Loan term cannot exceed 96 months");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// LEASE CALCULATIONS
// ============================================

const BC_GST_RATE = 0.05; // 5% Federal GST
const BC_PST_RATE = 0.07; // 7% Provincial PST

/**
 * Convert money factor to APR
 * Money Factor × 2400 = APR
 */
export function moneyFactorToAPR(moneyFactor: number): number {
  return roundToDecimals(moneyFactor * 2400, 2);
}

/**
 * Convert APR to money factor
 * APR / 2400 = Money Factor
 */
export function aprToMoneyFactor(apr: number): number {
  return roundToDecimals(apr / 2400, 6);
}

/**
 * Calculate lease payment and all related values
 *
 * Formulas:
 * - Residual Value = MSRP × Residual%
 * - Adjusted Cap Cost = Negotiated Price + Fees - (Down + Trade Equity + Rebates)
 * - Monthly Depreciation = (Adjusted Cap Cost - Residual Value) / Term
 * - Monthly Finance Fee = (Adjusted Cap Cost + Residual Value) × Money Factor
 * - Monthly Payment = Depreciation + Finance Fee + Tax
 */
export function calculateLease(input: LeaseInput): LeaseCalculation {
  // 1. Calculate Residual Value (always based on MSRP)
  const residualValue = roundCurrency(
    input.msrp * (input.residualPercent / 100),
  );

  // 2. Calculate Gross Cap Cost (price + fees)
  const grossCapCost = roundCurrency(
    input.negotiatedPrice + input.acquisitionFee,
  );

  // 3. Calculate Cap Cost Reductions
  const netTradeIn = input.tradeInValue - input.tradeInAmountOwed;
  const capCostReduction = roundCurrency(
    input.downPayment + Math.max(0, netTradeIn) + input.rebatesAndIncentives,
  );

  // 4. Calculate Adjusted Cap Cost (add negative equity if underwater on trade)
  const adjustedCapCost = roundCurrency(
    grossCapCost - capCostReduction + Math.max(0, -netTradeIn),
  );

  // 5. Calculate Depreciation (total and monthly)
  const depreciation = roundCurrency(adjustedCapCost - residualValue);
  const depreciationFee = roundCurrency(depreciation / input.termMonths);

  // 6. Calculate Finance/Rent Charge (total and monthly)
  // Finance fee formula: (Adjusted Cap + Residual) × Money Factor
  const financeFee = roundCurrency(
    (adjustedCapCost + residualValue) * input.moneyFactor,
  );
  const rentCharge = roundCurrency(financeFee * input.termMonths);

  // 7. Calculate Monthly Payment
  const monthlyPaymentPreTax = roundCurrency(depreciationFee + financeFee);
  const monthlyTax = roundCurrency(
    monthlyPaymentPreTax * (BC_GST_RATE + BC_PST_RATE),
  );
  const monthlyPayment = roundCurrency(monthlyPaymentPreTax + monthlyTax);

  // 8. Calculate Totals
  const totalMonthlyPayments = roundCurrency(monthlyPayment * input.termMonths);
  const totalLeaseCost = roundCurrency(
    totalMonthlyPayments +
      input.downPayment +
      input.securityDeposit +
      input.dispositionFee, // Assuming car is returned
  );
  const totalInterestPaid = rentCharge;

  // 9. Calculate Effective APR
  const effectiveAPR = moneyFactorToAPR(input.moneyFactor);

  // 10. Calculate Mileage Metrics
  const totalMileageAllowed =
    input.annualMileageAllowance * (input.termMonths / 12);
  const projectedTotalMileage =
    input.estimatedMileagePerYear * (input.termMonths / 12);
  const projectedExcessMileage = Math.max(
    0,
    projectedTotalMileage - totalMileageAllowed,
  );
  const excessMileageCharge = roundCurrency(
    projectedExcessMileage * input.excessMileageFee,
  );

  // 11. Calculate Cost Per KM
  const costPerKm =
    totalMileageAllowed > 0
      ? roundToDecimals(totalLeaseCost / projectedTotalMileage, 4)
      : 0;

  // 12. Calculate Buyout Price (if you want to keep the car)
  const buyoutPrice = roundCurrency(residualValue + input.dispositionFee);

  return {
    grossCapCost,
    capCostReduction,
    adjustedCapCost,
    residualValue,
    depreciation,
    depreciationFee,
    rentCharge,
    financeFee,
    monthlyPaymentPreTax,
    monthlyTax,
    monthlyPayment,
    totalMonthlyPayments,
    totalLeaseCost,
    totalInterestPaid,
    effectiveAPR,
    costPerKm,
    buyoutPrice,
    totalMileageAllowed: Math.round(totalMileageAllowed),
    projectedExcessMileage: Math.round(projectedExcessMileage),
    excessMileageCharge,
  };
}

/**
 * Compare leasing vs financing the same vehicle
 */
export function calculateLeaseVsBuyComparison(
  leaseInput: LeaseInput,
  financeInput: LoanInput,
  leaseCalc: LeaseCalculation,
  financeCalc: LoanSummary,
  termMonths: number,
): LeaseVsBuyComparison {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Monthly comparison
  const leaseMonthly = leaseCalc.monthlyPayment;
  const financeMonthly = financeCalc.monthlyPayment;
  const monthlyDifference = roundCurrency(financeMonthly - leaseMonthly);

  // Total cost over the lease term
  const leaseTotalCost = leaseCalc.totalLeaseCost;

  // For financing, calculate total paid over the SAME period as the lease
  const financePaymentsOverLeaseTerm = roundCurrency(
    financeMonthly * termMonths,
  );

  // Estimate vehicle value at lease end (use residual as proxy)
  const estimatedValueAtLeaseEnd = leaseCalc.residualValue;

  // Calculate remaining loan balance at lease-term end
  const monthlyRate = financeInput.annualRate / 100 / 12;
  let financeBalance = financeCalc.loanAmount;

  if (financeInput.annualRate > 0) {
    // Calculate remaining balance using amortization formula
    const factor = Math.pow(1 + monthlyRate, termMonths);
    financeBalance = roundCurrency(
      financeCalc.loanAmount * Math.pow(1 + monthlyRate, termMonths) -
        (financeMonthly * (factor - 1)) / monthlyRate,
    );
  } else {
    financeBalance = roundCurrency(
      financeCalc.loanAmount - financeMonthly * termMonths,
    );
  }

  // Equity in financed vehicle at lease-term end
  const financeEquity = roundCurrency(
    estimatedValueAtLeaseEnd - Math.max(0, financeBalance),
  );

  // Finance total cost (what you paid minus equity you have)
  const financeTotalCost = roundCurrency(
    financePaymentsOverLeaseTerm + financeInput.downPayment,
  );

  // Net position comparison
  const leaseEndValue = 0; // You return the car
  const financeEndValue = financeEquity;

  const leaseNetCost = leaseTotalCost - leaseEndValue;
  const financeNetCost = financeTotalCost - financeEndValue;

  // Determine recommendation
  let recommendation: "lease" | "buy" | "neutral" = "neutral";
  const netDifference = Math.abs(leaseNetCost - financeNetCost);
  const savingsAmount = roundCurrency(Math.abs(leaseNetCost - financeNetCost));

  if (netDifference < 1000) {
    recommendation = "neutral";
    reasons.push("Lease and finance costs are very similar over this term");
  } else if (leaseNetCost < financeNetCost) {
    recommendation = "lease";
    reasons.push(
      `Leasing saves approximately ${formatCurrency(savingsAmount)} over ${termMonths} months`,
    );
    if (monthlyDifference > 100) {
      reasons.push(
        `Lower monthly payment by ${formatCurrency(monthlyDifference)}/month`,
      );
    }
  } else {
    recommendation = "buy";
    reasons.push(`Financing builds ${formatCurrency(financeEquity)} in equity`);
    if (financeEquity > leaseTotalCost * 0.3) {
      reasons.push("Significant equity position at end of term");
    }
  }

  // Add relevant warnings
  if (leaseInput.estimatedMileagePerYear > leaseInput.annualMileageAllowance) {
    const excessKm =
      (leaseInput.estimatedMileagePerYear - leaseInput.annualMileageAllowance) *
      (termMonths / 12);
    warnings.push(
      `⚠️ Expected ${formatNumber(Math.round(excessKm))} km over allowance = ${formatCurrency(excessKm * leaseInput.excessMileageFee)} in fees`,
    );
  }

  if (leaseCalc.effectiveAPR > financeInput.annualRate + 1) {
    warnings.push(
      `⚠️ Lease APR (${leaseCalc.effectiveAPR}%) is higher than finance rate (${financeInput.annualRate}%)`,
    );
  }

  if (leaseInput.residualPercent < 45) {
    warnings.push("⚠️ Low residual value means higher depreciation cost");
  }

  return {
    leaseMonthly,
    financeMonthly,
    monthlyDifference,
    leaseTotalCost,
    financeTotalCost,
    leaseEndValue,
    financeEndValue,
    leaseNetCost,
    financeNetCost,
    recommendation,
    reasons,
    warnings,
    savingsAmount,
  };
}

/**
 * Analyze a lease deal quality
 */
export function analyzeLeaseQuality(
  input: LeaseInput,
  calculation: LeaseCalculation,
): LeaseAnalysis {
  const warnings: string[] = [];
  const salesTactics: string[] = [];
  const negotiationTips: string[] = [];

  // Market benchmarks (2024 Canadian market)
  const marketResidualRange = { min: 48, max: 65 };
  const marketMoneyFactorRange = { min: 0.00083, max: 0.00333 }; // 2-8% APR

  // Score residual value (higher is better for lessee)
  let residualScore = 50;
  if (input.residualPercent >= 58) residualScore = 100;
  else if (input.residualPercent >= 52) residualScore = 75;
  else if (input.residualPercent >= 48) residualScore = 50;
  else if (input.residualPercent >= 42) residualScore = 25;
  else residualScore = 10;

  // Score money factor (lower is better)
  let moneyFactorScore = 50;
  const apr = calculation.effectiveAPR;
  if (apr <= 2) moneyFactorScore = 100;
  else if (apr <= 4) moneyFactorScore = 85;
  else if (apr <= 6) moneyFactorScore = 65;
  else if (apr <= 8) moneyFactorScore = 40;
  else if (apr <= 10) moneyFactorScore = 20;
  else moneyFactorScore = 10;

  // Score mileage fit
  let mileageScore = 100;
  const mileageRatio =
    input.estimatedMileagePerYear / input.annualMileageAllowance;
  if (mileageRatio > 1.3) mileageScore = 20;
  else if (mileageRatio > 1.1) mileageScore = 50;
  else if (mileageRatio > 1.0) mileageScore = 70;
  else mileageScore = 100;

  // Calculate overall score
  const score = Math.round(
    residualScore * 0.35 + moneyFactorScore * 0.4 + mileageScore * 0.25,
  );

  // Determine rating
  let rating: LeaseAnalysis["rating"];
  if (score >= 80) rating = "excellent";
  else if (score >= 65) rating = "good";
  else if (score >= 45) rating = "fair";
  else rating = "poor";

  // Generate warnings
  if (apr > 8) {
    warnings.push(
      "Money factor is high - try negotiating a lower rate or check manufacturer specials",
    );
  }
  if (input.residualPercent < 45) {
    warnings.push(
      "Low residual value will increase your monthly payment significantly",
    );
  }
  if (mileageRatio > 1.0) {
    warnings.push(
      `You may exceed mileage allowance by ${formatNumber(Math.round((mileageRatio - 1) * input.annualMileageAllowance))} km/year`,
    );
  }
  if (input.negotiatedPrice >= input.msrp) {
    warnings.push(
      "You're paying MSRP - the cap cost is negotiable like a purchase price!",
    );
  }
  if (input.acquisitionFee > 800) {
    warnings.push(
      `Acquisition fee (${formatCurrency(input.acquisitionFee)}) is on the high side`,
    );
  }

  // Common sales tactics to watch for
  if (input.negotiatedPrice >= input.msrp * 0.98) {
    salesTactics.push(
      "Dealer may be hiding markup in the cap cost - negotiate the price down",
    );
  }
  if (apr > 6 && input.moneyFactor > 0.00167) {
    salesTactics.push(
      "Money factor may be marked up - ask for the 'buy rate' from the manufacturer",
    );
  }
  salesTactics.push(
    "Watch for 'payment packing' - unnecessary add-ons buried in the payment",
  );
  salesTactics.push(
    "Verify acquisition fee matches manufacturer's standard rate",
  );

  // Negotiation tips
  negotiationTips.push(
    "Negotiate the cap cost (price) BEFORE discussing lease terms",
  );
  negotiationTips.push(
    "Ask for the money factor in decimal form and verify APR = MF × 2400",
  );
  if (input.residualPercent < 55) {
    negotiationTips.push(
      "Check if higher mileage tier has better residual value",
    );
  }
  if (input.downPayment > 2000) {
    negotiationTips.push(
      "Consider lower down payment - you lose it if car is totaled",
    );
  }
  negotiationTips.push("Ask about manufacturer loyalty/conquest rebates");
  negotiationTips.push(
    "Time your lease end around model year changes for better deals",
  );

  return {
    score,
    rating,
    residualScore,
    moneyFactorScore,
    mileageScore,
    warnings,
    salesTactics,
    negotiationTips,
    marketResidualRange,
    marketMoneyFactorRange,
  };
}

/**
 * Get default lease inputs for a vehicle
 */
export function getDefaultLeaseInput(
  msrp: number,
  termMonths: number = 36,
): LeaseInput {
  // Default residual percentages by term
  const residualByTerm: Record<number, number> = {
    24: 62,
    36: 55,
    48: 48,
    60: 42,
  };

  return {
    msrp,
    negotiatedPrice: msrp, // Start at MSRP, user should negotiate down
    downPayment: 0,
    tradeInValue: 0,
    tradeInAmountOwed: 0,
    residualPercent: residualByTerm[termMonths] || 55,
    moneyFactor: 0.00167, // ~4% APR
    termMonths,
    annualMileageAllowance: 20000, // km/year (common in Canada)
    excessMileageFee: 0.15, // $/km
    acquisitionFee: 595,
    dispositionFee: 395,
    securityDeposit: 0,
    rebatesAndIncentives: 0,
    estimatedMileagePerYear: 20000,
  };
}
