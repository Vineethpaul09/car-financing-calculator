// ============================================
// TYPES & INTERFACES
// ============================================

export interface LoanInput {
  vehiclePrice: number;
  downPayment: number;
  annualRate: number;
  termMonths: number;
  isNewVehicle: boolean;
  monthlyIncome?: number;
  monthlyInsurance?: number;
  monthlyFuel?: number; // Optional manual override for energy cost
  // New fields for enhanced calculations
  tradeInValue?: number;
  tradeInAmountOwed?: number;
  cashIncentives?: number;
  estimatedMileagePerYear?: number;
  drivetrain?: DrivetrainType;
  fuelEfficiencyLPer100km?: number;
  electricEfficiencyKWhPer100km?: number;
  gasPricePerL?: number;
  electricityPricePerKWh?: number;
  phevElectricShare?: number; // Percentage of km on electric for PHEVs
}

export type DrivetrainType = "gas" | "hybrid" | "phev" | "ev";

export interface MonthlyBreakdown {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface LoanSummary {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
  interestToPrincipalRatio: number;
  // Enhanced fields
  netTradeInCredit?: number;
  amountFinanced?: number;
}

export interface BCTaxes {
  gst: number;
  pst: number;
  totalTax: number;
  priceWithTax: number;
}

export interface BiWeeklyComparison {
  monthlyPayment: number;
  biWeeklyPayment: number;
  monthlyTotalInterest: number;
  biWeeklyTotalInterest: number;
  interestSaved: number;
  monthsSaved: number;
}

export interface EarlyPayoffResult {
  newPayoffMonths: number;
  interestSaved: number;
  totalInterestPaid: number;
  originalTotalInterest: number;
}

export interface TermComparison {
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  rating: number; // 1-5 stars
  isRecommended?: boolean;
}

export type DealRating = "excellent" | "good" | "fair" | "bad";
export type AffordabilityStatus = "good" | "warning" | "danger";

export interface DealAnalysis {
  rating: DealRating;
  score: number; // 0-100
  reasons: string[];
  warnings: string[];
  recommendations: string[];
  rule2410: Rule2410Result;
  rateQuality: RateQuality;
  ltvRatio: number;
  dtiRatio?: number;
}

export interface Rule2410Result {
  downPaymentPassed: boolean;
  termPassed: boolean;
  affordabilityPassed: boolean;
  downPaymentPercent: number;
  termMonths: number;
  carCostPercent?: number;
}

export interface RateQuality {
  quality: "excellent" | "good" | "average" | "poor" | "predatory";
  tierAverage: number;
  difference: number;
}

export interface CreditTier {
  name: string;
  scoreRange: string;
  newRateRange: { min: number; max: number };
  usedRateRange: { min: number; max: number };
}

// Total Cost of Ownership
export interface TotalCostOfOwnership {
  monthlyPayment: number;
  insurance: number;
  fuel: number;
  maintenance: number;
  depreciation: number;
  totalMonthly: number;
  totalAnnual: number;
  totalOverTerm: number;
  perMileCost: number;
  energy?: EnergyCostResult;
  maintenanceRatePerKm?: number;
  annualMileage?: number;
}

// Depreciation
export interface DepreciationForecast {
  year: number;
  value: number;
  depreciationAmount: number;
  cumulativeDepreciation: number;
  percentRetained: number;
}

export interface EnergyCostResult {
  annualGasCost: number;
  annualElectricCost: number;
  annualEnergyCost: number;
  monthlyEnergyCost: number;
  perKmEnergyCost: number;
  annualLitersUsed?: number;
  annualKWhUsed?: number;
}

// Dashboard tab
export type DashboardTab =
  | "summary"
  | "breakdown"
  | "schedule"
  | "compare"
  | "tco"
  | "lease";

export interface CalculatorState {
  input: LoanInput;
  results: LoanSummary | null;
  taxes: BCTaxes | null;
  analysis: DealAnalysis | null;
  termComparisons: TermComparison[];
  amortizationSchedule: MonthlyBreakdown[];
  biWeeklyComparison: BiWeeklyComparison | null;
  totalCostOfOwnership: TotalCostOfOwnership | null;
  depreciationForecast: DepreciationForecast[];
  activeTab: DashboardTab;
}

// ============================================
// LEASE TYPES
// ============================================

export interface LeaseInput {
  msrp: number; // Manufacturer's Suggested Retail Price
  negotiatedPrice: number; // Capitalized cost (negotiated price)
  downPayment: number; // Cap cost reduction (down payment)
  tradeInValue: number;
  tradeInAmountOwed: number;
  residualPercent: number; // Residual value as % of MSRP (typically 50-65%)
  moneyFactor: number; // Lease interest factor (divide by 2400 for APR equivalent)
  termMonths: number; // Typically 24, 36, 48 months
  annualMileageAllowance: number; // km/year (typically 16k, 20k, 24k in Canada)
  excessMileageFee: number; // $/km over allowance (typically $0.10-0.25)
  acquisitionFee: number; // Dealer/bank fee (typically $500-1000)
  dispositionFee: number; // Fee at lease end if not buying (typically $300-500)
  securityDeposit: number; // Sometimes waived
  rebatesAndIncentives: number;
  estimatedMileagePerYear: number; // Your actual expected usage
}

export interface LeaseCalculation {
  // Core payment components
  grossCapCost: number; // MSRP or negotiated price + fees
  capCostReduction: number; // Down payment + trade equity + rebates
  adjustedCapCost: number; // Net amount being financed
  residualValue: number; // Value at lease end ($ amount)
  depreciation: number; // Cap cost - residual (total depreciation)
  depreciationFee: number; // Monthly depreciation portion
  rentCharge: number; // Total interest/finance charge
  financeFee: number; // Monthly finance portion
  monthlyPaymentPreTax: number;
  monthlyTax: number;
  monthlyPayment: number; // Total monthly with tax
  // Totals
  totalMonthlyPayments: number;
  totalLeaseCost: number; // All money out of pocket
  totalInterestPaid: number;
  // Derived metrics
  effectiveAPR: number; // Money factor × 2400
  costPerKm: number;
  // End of lease options
  buyoutPrice: number; // Residual + any fees
  totalMileageAllowed: number;
  projectedExcessMileage: number;
  excessMileageCharge: number;
}

export interface LeaseVsBuyComparison {
  // Monthly comparison
  leaseMonthly: number;
  financeMonthly: number;
  monthlyDifference: number;
  // Total cost comparison
  leaseTotalCost: number;
  financeTotalCost: number;
  // What you have at the end
  leaseEndValue: number; // $0 (you return the car) or buyout cost
  financeEndValue: number; // Estimated vehicle value (equity)
  // Net position
  leaseNetCost: number; // Total cost - end value
  financeNetCost: number;
  // Recommendation
  recommendation: "lease" | "buy" | "neutral";
  reasons: string[];
  warnings: string[];
  savingsAmount: number;
}

export interface LeaseAnalysis {
  score: number; // 0-100
  rating: "excellent" | "good" | "fair" | "poor";
  // Component scores
  residualScore: number;
  moneyFactorScore: number;
  mileageScore: number;
  // Issues and tips
  warnings: string[];
  salesTactics: string[]; // Things to watch for
  negotiationTips: string[];
  // Benchmarks
  marketResidualRange: { min: number; max: number };
  marketMoneyFactorRange: { min: number; max: number };
}
