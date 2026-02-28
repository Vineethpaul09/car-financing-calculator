import { useMemo, useState } from "react";
import type {
  LoanInput,
  LoanSummary,
  DashboardTab,
  AffordabilityStatus,
  TermComparison,
  MonthlyBreakdown,
  TotalCostOfOwnership,
  DepreciationForecast,
  DealAnalysis,
  LeaseInput,
  LeaseCalculation,
  LeaseAnalysis,
  LeaseVsBuyComparison,
} from "./types";
import {
  calculateLoanSummary,
  compareLoanTerms,
  generateAmortizationSchedule,
  calculateBiWeeklyBenefits,
  calculateWeeklyBenefits,
  calculateTotalCostOfOwnership,
  calculateDepreciationForecast,
  calculateDTI,
  calculateEarlyPayoff,
  formatCurrency,
  calculateLease,
  analyzeLeaseQuality,
  calculateLeaseVsBuyComparison,
  getDefaultLeaseInput,
} from "./utils/calculations";
import { calculateBCTaxes } from "./utils/bcTaxes";
import { analyzeDeal } from "./utils/dealRating";
import {
  HeroPaymentCard,
  DonutChart,
  QuickMetrics,
  TabNavigation,
  BottomNavigation,
  TermComparisonCards,
  InputPanel,
  AmortizationTable,
  TCOPanel,
  LeaseInputPanel,
  LeaseResultsPanel,
} from "./components/Dashboard";
import "./App.css";

const defaultInput: LoanInput = {
  vehiclePrice: 35000,
  downPayment: 7000,
  annualRate: 6.99,
  termMonths: 60,
  isNewVehicle: true,
  monthlyIncome: 5000,
  monthlyInsurance: 150,
  tradeInValue: 0,
  tradeInAmountOwed: 0,
  cashIncentives: 0,
  estimatedMileagePerYear: 20000,
  drivetrain: "gas",
  fuelEfficiencyLPer100km: 8.5,
  electricEfficiencyKWhPer100km: 19,
  gasPricePerL: 1.85,
  electricityPricePerKWh: 0.15,
  phevElectricShare: 60,
};

function Dashboard() {
  const [input, setInput] = useState<LoanInput>(defaultInput);
  const [activeTab, setActiveTab] = useState<DashboardTab>("summary");
  const [extraPayment, setExtraPayment] = useState<number>(50);

  // Lease state - initialize with vehicle price from finance input
  const [leaseInput, setLeaseInput] = useState<LeaseInput>(() =>
    getDefaultLeaseInput(defaultInput.vehiclePrice, 36),
  );

  // Sync lease MSRP with finance vehicle price when it changes
  const handleFinanceInputChange = (newInput: LoanInput) => {
    setInput(newInput);
    // Update lease MSRP if vehicle price changed
    if (newInput.vehiclePrice !== input.vehiclePrice) {
      setLeaseInput((prev) => ({
        ...prev,
        msrp: newInput.vehiclePrice,
        negotiatedPrice: newInput.vehiclePrice,
      }));
    }
  };

  // Calculate all derived values
  const results = useMemo<LoanSummary>(
    () => calculateLoanSummary(input),
    [input],
  );
  const taxes = useMemo(
    () => calculateBCTaxes(input.vehiclePrice, input.isNewVehicle),
    [input.vehiclePrice, input.isNewVehicle],
  );
  const termComparisons = useMemo<TermComparison[]>(
    () => compareLoanTerms(input, taxes.totalTax),
    [input, taxes.totalTax],
  );
  const amortizationSchedule = useMemo<MonthlyBreakdown[]>(
    () => generateAmortizationSchedule(input),
    [input],
  );
  const biWeeklyComparison = useMemo(
    () => calculateBiWeeklyBenefits(input),
    [input],
  );
  const weeklyComparison = useMemo(
    () => calculateWeeklyBenefits(input),
    [input],
  );
  const tco = useMemo<TotalCostOfOwnership>(
    () => calculateTotalCostOfOwnership(input, results.monthlyPayment),
    [input, results.monthlyPayment],
  );
  const depreciation = useMemo<DepreciationForecast[]>(
    () =>
      calculateDepreciationForecast(input.vehiclePrice, input.isNewVehicle, 7),
    [input.vehiclePrice, input.isNewVehicle],
  );
  const analysis = useMemo<DealAnalysis>(() => analyzeDeal(input), [input]);

  // Lease calculations
  const leaseCalculation = useMemo<LeaseCalculation>(
    () => calculateLease(leaseInput),
    [leaseInput],
  );

  const leaseAnalysis = useMemo<LeaseAnalysis>(
    () => analyzeLeaseQuality(leaseInput, leaseCalculation),
    [leaseInput, leaseCalculation],
  );

  const leaseVsBuyComparison = useMemo<LeaseVsBuyComparison | null>(() => {
    // Create a finance input that mirrors the lease for comparison
    const financeForComparison: LoanInput = {
      ...input,
      vehiclePrice: leaseInput.negotiatedPrice,
      downPayment: leaseInput.downPayment,
      tradeInValue: leaseInput.tradeInValue,
      tradeInAmountOwed: leaseInput.tradeInAmountOwed,
      termMonths: leaseInput.termMonths,
    };
    const financeCalcForComparison = calculateLoanSummary(financeForComparison);

    return calculateLeaseVsBuyComparison(
      leaseInput,
      financeForComparison,
      leaseCalculation,
      financeCalcForComparison,
      leaseInput.termMonths,
    );
  }, [leaseInput, leaseCalculation, input]);

  const normalizedExtraPayment = Math.max(0, extraPayment);
  const earlyPayoff = useMemo(
    () => calculateEarlyPayoff(input, normalizedExtraPayment),
    [input, normalizedExtraPayment],
  );

  // Calculate affordability status
  const affordabilityStatus = useMemo<AffordabilityStatus>(() => {
    if (!input.monthlyIncome) return "good";
    const dti = calculateDTI(results.monthlyPayment, input.monthlyIncome);
    if (dti <= 10) return "good";
    if (dti <= 15) return "warning";
    return "danger";
  }, [results.monthlyPayment, input.monthlyIncome]);

  // Calculate payoff date
  const payoffDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + input.termMonths);
    return date;
  }, [input.termMonths]);

  const acceleratedPayoffDate = useMemo(() => {
    const months = earlyPayoff.newPayoffMonths || input.termMonths;
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
  }, [earlyPayoff.newPayoffMonths, input.termMonths]);

  // Derived metrics
  const downPaymentPercent = (input.downPayment / input.vehiclePrice) * 100;
  const dtiRatio = input.monthlyIncome
    ? calculateDTI(results.monthlyPayment, input.monthlyIncome)
    : undefined;

  const monthsFaster =
    results.loanAmount > 0 && earlyPayoff.newPayoffMonths > 0
      ? Math.max(0, input.termMonths - earlyPayoff.newPayoffMonths)
      : 0;

  const handleTermSelect = (term: number) => {
    setInput((prev) => ({ ...prev, termMonths: term }));
  };

  const handleExtraChange = (value: number) => {
    if (Number.isNaN(value)) return;
    setExtraPayment(Math.min(Math.max(0, value), 2000));
  };

  const canAccelerate = results.loanAmount > 0;

  return (
    <div className="app" data-theme="professional">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title"> Car Financing Calculator</h1>
            <span className="app-subtitle">Vancouver, BC</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-layout">
          {/* Input Panel (Always visible sidebar) */}
          <aside className="input-sidebar">
            <div className="input-sidebar-header">
              <h2>
                {activeTab === "lease" ? "Lease Details" : "Loan Details"}
              </h2>
            </div>
            {activeTab === "lease" ? (
              <LeaseInputPanel input={leaseInput} onChange={setLeaseInput} />
            ) : (
              <InputPanel
                input={input}
                onInputChange={handleFinanceInputChange}
              />
            )}
          </aside>
          {/* Gmail: Vineeth@gmail.com password: vineeth@ronin123 */}
          {/* Main Dashboard Content */}
          <div className="dashboard-content">
            {/* Tab Navigation (Desktop) */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Hero Card - Always visible */}
            <HeroPaymentCard
              monthlyPayment={results.monthlyPayment}
              term={input.termMonths}
              totalCost={
                results.totalPayment + input.downPayment + taxes.totalTax
              }
              totalInterest={results.totalInterest}
              affordabilityStatus={affordabilityStatus}
              payoffDate={payoffDate}
            />

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "summary" && (
                <div className="tab-panel">
                  <QuickMetrics
                    loanAmount={results.loanAmount}
                    totalInterest={results.totalInterest}
                    effectiveRate={results.effectiveRate}
                    termMonths={input.termMonths}
                    dtiRatio={dtiRatio}
                    downPaymentPercent={downPaymentPercent}
                    biWeeklySavings={biWeeklyComparison.interestSaved}
                    dealScore={analysis.score}
                  />

                  <div className="cadence-card">
                    <div className="cadence-header">
                      <p className="extra-payment-eyebrow">Payment cadence</p>
                      <h3 className="extra-payment-title">
                        Monthly vs. bi-weekly vs. weekly
                      </h3>
                      <p className="extra-payment-subtext">
                        Smaller, more frequent payments usually cut total
                        interest and finish sooner.
                      </p>
                    </div>
                    <div className="cadence-grid">
                      <div className="cadence-tile">
                        <span className="stat-label">Monthly</span>
                        <span className="stat-value">
                          {formatCurrency(results.monthlyPayment)}
                        </span>
                        <span className="stat-subvalue">
                          Interest{" "}
                          {formatCurrency(
                            weeklyComparison.monthlyTotalInterest,
                          )}
                        </span>
                      </div>
                      <div className="cadence-tile">
                        <span className="stat-label">Bi-weekly</span>
                        <span className="stat-value">
                          {formatCurrency(biWeeklyComparison.biWeeklyPayment)}
                        </span>
                        <span className="stat-subvalue">
                          Saves{" "}
                          {formatCurrency(biWeeklyComparison.interestSaved)}{" "}
                          interest
                        </span>
                        <span className="stat-chip">
                          ≈ {biWeeklyComparison.monthsSaved} mo sooner
                        </span>
                      </div>
                      <div className="cadence-tile">
                        <span className="stat-label">Weekly</span>
                        <span className="stat-value">
                          {formatCurrency(weeklyComparison.weeklyPayment)}
                        </span>
                        <span className="stat-subvalue">
                          Saves {formatCurrency(weeklyComparison.interestSaved)}{" "}
                          interest
                        </span>
                        <span className="stat-chip">
                          ≈ {weeklyComparison.monthsSaved} mo sooner
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="extra-payment-card">
                    <div className="extra-payment-top">
                      <div>
                        <p className="extra-payment-eyebrow">
                          Early payoff estimator
                        </p>
                        <h3 className="extra-payment-title">
                          Save {formatCurrency(earlyPayoff.interestSaved)} in
                          interest
                        </h3>
                        <p className="extra-payment-subtext">
                          {canAccelerate
                            ? monthsFaster > 0
                              ? `Add a little extra each month to finish about ${monthsFaster} months sooner.`
                              : "Add an extra payment to shorten the term and cut total interest."
                            : "Enter your loan details to see how extra payments change the payoff date."}
                        </p>
                      </div>
                      <div className="extra-payment-input">
                        <label
                          className="input-label"
                          htmlFor="extra-payment-input"
                        >
                          Extra per month
                        </label>
                        <div className="input-with-prefix">
                          <span className="input-prefix">$</span>
                          <input
                            id="extra-payment-input"
                            type="number"
                            className="input-field"
                            value={normalizedExtraPayment}
                            min={0}
                            max={2000}
                            step={25}
                            onChange={(e) =>
                              handleExtraChange(Number(e.target.value))
                            }
                            disabled={!canAccelerate}
                          />
                        </div>
                      </div>
                    </div>

                    <input
                      type="range"
                      className="extra-payment-slider"
                      min={0}
                      max={500}
                      step={25}
                      value={normalizedExtraPayment}
                      onChange={(e) =>
                        handleExtraChange(Number(e.target.value))
                      }
                      disabled={!canAccelerate}
                      aria-label="Adjust extra monthly payment"
                    />

                    <div className="extra-payment-stats">
                      <div className="extra-payment-stat">
                        <span className="stat-label">New payoff date</span>
                        <span className="stat-value">
                          {acceleratedPayoffDate.toLocaleDateString("en-CA", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="extra-payment-stat">
                        <span className="stat-label">Months sooner</span>
                        <span className="stat-value">
                          {monthsFaster > 0
                            ? `${monthsFaster} mo`
                            : "Same term"}
                        </span>
                      </div>
                      <div className="extra-payment-stat">
                        <span className="stat-label">Total interest</span>
                        <span className="stat-value">
                          {formatCurrency(earlyPayoff.totalInterestPaid)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deal Analysis Summary */}
                  {analysis.warnings.length > 0 && (
                    <div className="warnings-card">
                      <h4> Considerations</h4>
                      <ul>
                        {analysis.warnings.slice(0, 3).map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendations.length > 0 && (
                    <div className="recommendations-card">
                      <h4> Recommendations</h4>
                      <ul>
                        {analysis.recommendations.slice(0, 3).map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "breakdown" && (
                <div className="tab-panel">
                  <DonutChart
                    principal={results.loanAmount}
                    interest={results.totalInterest}
                    taxes={taxes.totalTax}
                    downPayment={input.downPayment}
                  />
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="tab-panel">
                  <AmortizationTable schedule={amortizationSchedule} />
                </div>
              )}

              {activeTab === "compare" && (
                <div className="tab-panel">
                  <TermComparisonCards
                    comparisons={termComparisons}
                    selectedTerm={input.termMonths}
                    onSelectTerm={handleTermSelect}
                  />
                </div>
              )}

              {activeTab === "tco" && (
                <div className="tab-panel">
                  <TCOPanel
                    tco={tco}
                    depreciation={depreciation}
                    vehiclePrice={input.vehiclePrice}
                  />
                </div>
              )}

              {activeTab === "lease" && (
                <div className="tab-panel lease-tab">
                  <LeaseResultsPanel
                    input={leaseInput}
                    calculation={leaseCalculation}
                    analysis={leaseAnalysis}
                    comparison={leaseVsBuyComparison}
                    showComparison={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return <Dashboard />;
}

export default App;
