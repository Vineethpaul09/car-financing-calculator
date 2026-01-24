import type {
  LeaseCalculation,
  LeaseInput,
  LeaseAnalysis,
  LeaseVsBuyComparison,
} from "../../types";
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatPercent,
} from "../../utils/calculations";
import "./LeaseResultsPanel.css";

interface LeaseResultsPanelProps {
  input: LeaseInput;
  calculation: LeaseCalculation;
  analysis: LeaseAnalysis;
  comparison: LeaseVsBuyComparison | null;
  showComparison: boolean;
}

export default function LeaseResultsPanel({
  input,
  calculation,
  analysis,
  comparison,
  showComparison,
}: LeaseResultsPanelProps) {
  const formatMoney = (v: number) => formatCurrency(v);
  const formatDetailed = (v: number) => formatCurrencyDetailed(v);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "#22c55e";
      case "good":
        return "#3b82f6";
      case "fair":
        return "#f59e0b";
      case "poor":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "linear-gradient(135deg, #22c55e, #16a34a)";
    if (score >= 65) return "linear-gradient(135deg, #3b82f6, #2563eb)";
    if (score >= 45) return "linear-gradient(135deg, #f59e0b, #d97706)";
    return "linear-gradient(135deg, #ef4444, #dc2626)";
  };

  return (
    <div className="lease-results-panel">
      {/* Hero Payment Card */}
      <div className="lease-hero">
        <div className="hero-content">
          <div className="hero-label">Monthly Lease Payment</div>
          <div className="hero-amount">
            {formatDetailed(calculation.monthlyPayment)}
          </div>
          <div className="hero-breakdown">
            <span>
              {formatMoney(calculation.monthlyPaymentPreTax)} +{" "}
              {formatMoney(calculation.monthlyTax)} tax
            </span>
          </div>
        </div>
        <div
          className="hero-score"
          style={{ background: getScoreGradient(analysis.score) }}
        >
          <div className="score-value">{analysis.score}</div>
          <div className="score-label">{analysis.rating.toUpperCase()}</div>
        </div>
      </div>

      {/* Due at Signing */}
      <div className="due-at-signing">
        <h4>Due at Signing</h4>
        <div className="signing-breakdown">
          <div className="signing-item">
            <span>First month payment</span>
            <span>{formatMoney(calculation.monthlyPayment)}</span>
          </div>
          {input.downPayment > 0 && (
            <div className="signing-item">
              <span>Down payment (cap reduction)</span>
              <span>{formatMoney(input.downPayment)}</span>
            </div>
          )}
          {input.acquisitionFee > 0 && (
            <div className="signing-item">
              <span>Acquisition fee</span>
              <span>{formatMoney(input.acquisitionFee)}</span>
            </div>
          )}
          {input.securityDeposit > 0 && (
            <div className="signing-item refundable">
              <span>Security deposit (refundable)</span>
              <span>{formatMoney(input.securityDeposit)}</span>
            </div>
          )}
          {input.rebatesAndIncentives > 0 && (
            <div className="signing-item rebate">
              <span>Lease rebate applied</span>
              <span>−{formatMoney(input.rebatesAndIncentives)}</span>
            </div>
          )}
          <div className="signing-total">
            <span>Total due at signing</span>
            <span>
              {formatMoney(
                calculation.monthlyPayment +
                  input.downPayment +
                  input.acquisitionFee +
                  input.securityDeposit,
              )}
            </span>
          </div>
          {input.securityDeposit > 0 && (
            <div className="signing-note">
              *Security deposit returned at lease end if no excess wear
            </div>
          )}
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="results-card">
        <h4>Monthly Payment Breakdown</h4>
        <div className="breakdown-visual">
          <div className="bar-container">
            <div
              className="bar-segment depreciation"
              style={{
                width: `${(calculation.depreciationFee / calculation.monthlyPaymentPreTax) * 100}%`,
              }}
            />
            <div
              className="bar-segment finance"
              style={{
                width: `${(calculation.financeFee / calculation.monthlyPaymentPreTax) * 100}%`,
              }}
            />
          </div>
          <div className="bar-legend">
            <div className="legend-item">
              <span className="legend-color depreciation"></span>
              <span>
                Depreciation: {formatMoney(calculation.depreciationFee)}
              </span>
            </div>
            <div className="legend-item">
              <span className="legend-color finance"></span>
              <span>Finance: {formatMoney(calculation.financeFee)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Lease Cost</div>
          <div className="metric-value">
            {formatMoney(calculation.totalLeaseCost)}
          </div>
          <div className="metric-subtitle">Over {input.termMonths} months</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Effective APR</div>
          <div className="metric-value">
            {formatPercent(calculation.effectiveAPR)}
          </div>
          <div className="metric-subtitle">
            MF: {input.moneyFactor.toFixed(5)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Interest</div>
          <div className="metric-value">
            {formatMoney(calculation.totalInterestPaid)}
          </div>
          <div className="metric-subtitle">Rent charge</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Cost per KM</div>
          <div className="metric-value">
            ${calculation.costPerKm.toFixed(2)}
          </div>
          <div className="metric-subtitle">Based on your driving</div>
        </div>
      </div>

      {/* Capitalization Details */}
      <div className="results-card">
        <h4>Capitalization Breakdown</h4>
        <div className="cap-breakdown">
          <div className="cap-row">
            <span>MSRP</span>
            <span>{formatMoney(input.msrp)}</span>
          </div>
          <div className="cap-row indent">
            <span>Negotiated Price</span>
            <span
              className={input.negotiatedPrice < input.msrp ? "savings" : ""}
            >
              {formatMoney(input.negotiatedPrice)}
              {input.negotiatedPrice < input.msrp && (
                <span className="savings-note">
                  {" "}
                  (−{formatMoney(input.msrp - input.negotiatedPrice)})
                </span>
              )}
            </span>
          </div>
          <div className="cap-row indent">
            <span>+ Acquisition Fee</span>
            <span>{formatMoney(input.acquisitionFee)}</span>
          </div>
          <div className="cap-row subtotal">
            <span>Gross Cap Cost</span>
            <span>{formatMoney(calculation.grossCapCost)}</span>
          </div>
          {calculation.capCostReduction > 0 && (
            <>
              {input.downPayment > 0 && (
                <div className="cap-row indent reduction">
                  <span>− Down Payment</span>
                  <span>−{formatMoney(input.downPayment)}</span>
                </div>
              )}
              {input.rebatesAndIncentives > 0 && (
                <div className="cap-row indent reduction">
                  <span>− Lease Rebate</span>
                  <span>−{formatMoney(input.rebatesAndIncentives)}</span>
                </div>
              )}
              {input.tradeInValue - input.tradeInAmountOwed > 0 && (
                <div className="cap-row indent reduction">
                  <span>− Trade-In Equity</span>
                  <span>
                    −{formatMoney(input.tradeInValue - input.tradeInAmountOwed)}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="cap-row total">
            <span>Adjusted Cap Cost</span>
            <span>{formatMoney(calculation.adjustedCapCost)}</span>
          </div>
          <div className="cap-row">
            <span>Residual Value ({input.residualPercent}%)</span>
            <span>{formatMoney(calculation.residualValue)}</span>
          </div>
          <div className="cap-row total highlight">
            <span>Depreciation (you pay for)</span>
            <span>{formatMoney(calculation.depreciation)}</span>
          </div>
        </div>
      </div>

      {/* Mileage Analysis */}
      {(calculation.projectedExcessMileage > 0 ||
        input.estimatedMileagePerYear !== input.annualMileageAllowance) && (
        <div className="results-card mileage-warning">
          <h4>🛣️ Mileage Analysis</h4>
          <div className="mileage-details">
            <div className="mileage-row">
              <span>Annual allowance</span>
              <span>{input.annualMileageAllowance.toLocaleString()} km</span>
            </div>
            <div className="mileage-row">
              <span>Your expected driving</span>
              <span>{input.estimatedMileagePerYear.toLocaleString()} km</span>
            </div>
            <div className="mileage-row">
              <span>Total over {input.termMonths} months</span>
              <span>
                {calculation.totalMileageAllowed.toLocaleString()} km allowed
              </span>
            </div>
            {calculation.projectedExcessMileage > 0 && (
              <>
                <div className="mileage-row warning">
                  <span>Projected excess</span>
                  <span>
                    {calculation.projectedExcessMileage.toLocaleString()} km
                  </span>
                </div>
                <div className="mileage-row warning total">
                  <span>Excess mileage fee</span>
                  <span>{formatMoney(calculation.excessMileageCharge)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* End of Lease Options */}
      <div className="results-card">
        <h4>🔑 End of Lease Options</h4>
        <div className="end-options">
          <div className="option-card">
            <div className="option-icon">↩️</div>
            <div className="option-title">Return It</div>
            <div className="option-cost">
              {input.dispositionFee > 0
                ? `+${formatMoney(input.dispositionFee)} disposition fee`
                : "No cost"}
            </div>
            <div className="option-note">
              Pay excess mileage/wear charges if any
            </div>
          </div>
          <div className="option-card">
            <div className="option-icon">🛒</div>
            <div className="option-title">Buy It</div>
            <div className="option-cost">
              {formatMoney(calculation.buyoutPrice)}
            </div>
            <div className="option-note">Residual value + any fees</div>
          </div>
          <div className="option-card">
            <div className="option-icon">🔄</div>
            <div className="option-title">Lease Another</div>
            <div className="option-cost">Often waives disposition fee</div>
            <div className="option-note">Start fresh with new model</div>
          </div>
        </div>
      </div>

      {/* Deal Analysis */}
      <div className="results-card analysis-card">
        <h4>📊 Deal Analysis</h4>

        <div className="score-breakdown">
          <div className="score-item">
            <div className="score-bar-label">
              <span>Residual Value</span>
              <span>{analysis.residualScore}/100</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis.residualScore}%`,
                  background: getRatingColor(
                    analysis.residualScore >= 75
                      ? "excellent"
                      : analysis.residualScore >= 50
                        ? "good"
                        : analysis.residualScore >= 25
                          ? "fair"
                          : "poor",
                  ),
                }}
              />
            </div>
          </div>
          <div className="score-item">
            <div className="score-bar-label">
              <span>Money Factor</span>
              <span>{analysis.moneyFactorScore}/100</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis.moneyFactorScore}%`,
                  background: getRatingColor(
                    analysis.moneyFactorScore >= 75
                      ? "excellent"
                      : analysis.moneyFactorScore >= 50
                        ? "good"
                        : analysis.moneyFactorScore >= 25
                          ? "fair"
                          : "poor",
                  ),
                }}
              />
            </div>
          </div>
          <div className="score-item">
            <div className="score-bar-label">
              <span>Mileage Fit</span>
              <span>{analysis.mileageScore}/100</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis.mileageScore}%`,
                  background: getRatingColor(
                    analysis.mileageScore >= 75
                      ? "excellent"
                      : analysis.mileageScore >= 50
                        ? "good"
                        : analysis.mileageScore >= 25
                          ? "fair"
                          : "poor",
                  ),
                }}
              />
            </div>
          </div>
        </div>

        {analysis.warnings.length > 0 && (
          <div className="analysis-section warnings">
            <h5>⚠️ Warnings</h5>
            <ul>
              {analysis.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.salesTactics.length > 0 && (
          <div className="analysis-section tactics">
            <h5>👀 Watch For</h5>
            <ul>
              {analysis.salesTactics.map((tactic, i) => (
                <li key={i}>{tactic}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.negotiationTips.length > 0 && (
          <div className="analysis-section tips">
            <h5>💡 Negotiation Tips</h5>
            <ul>
              {analysis.negotiationTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Lease vs Buy Comparison */}
      {showComparison && comparison && (
        <div className="results-card comparison-card">
          <h4>⚖️ Lease vs Finance Comparison</h4>

          <div className="comparison-hero">
            <div className={`recommendation ${comparison.recommendation}`}>
              {comparison.recommendation === "lease" &&
                "🏆 Leasing looks better"}
              {comparison.recommendation === "buy" &&
                "🏆 Financing looks better"}
              {comparison.recommendation === "neutral" &&
                "⚖️ Both options similar"}
            </div>
            {comparison.savingsAmount > 1000 && (
              <div className="savings-badge">
                Save ~{formatMoney(comparison.savingsAmount)}
              </div>
            )}
          </div>

          <div className="comparison-grid">
            <div className="comparison-column lease">
              <h5>Lease</h5>
              <div className="comparison-stat">
                <span>Monthly</span>
                <span className="value">
                  {formatMoney(comparison.leaseMonthly)}
                </span>
              </div>
              <div className="comparison-stat">
                <span>Total Cost</span>
                <span className="value">
                  {formatMoney(comparison.leaseTotalCost)}
                </span>
              </div>
              <div className="comparison-stat">
                <span>At End</span>
                <span className="value">
                  {formatMoney(comparison.leaseEndValue)}
                </span>
              </div>
              <div className="comparison-stat net">
                <span>Net Cost</span>
                <span className="value">
                  {formatMoney(comparison.leaseNetCost)}
                </span>
              </div>
            </div>

            <div className="comparison-column finance">
              <h5>Finance</h5>
              <div className="comparison-stat">
                <span>Monthly</span>
                <span className="value">
                  {formatMoney(comparison.financeMonthly)}
                </span>
              </div>
              <div className="comparison-stat">
                <span>Total Cost</span>
                <span className="value">
                  {formatMoney(comparison.financeTotalCost)}
                </span>
              </div>
              <div className="comparison-stat">
                <span>Equity</span>
                <span className="value">
                  {formatMoney(comparison.financeEndValue)}
                </span>
              </div>
              <div className="comparison-stat net">
                <span>Net Cost</span>
                <span className="value">
                  {formatMoney(comparison.financeNetCost)}
                </span>
              </div>
            </div>
          </div>

          {comparison.reasons.length > 0 && (
            <div className="comparison-reasons">
              {comparison.reasons.map((reason, i) => (
                <div key={i} className="reason">
                  ✓ {reason}
                </div>
              ))}
            </div>
          )}

          {comparison.warnings.length > 0 && (
            <div className="comparison-warnings">
              {comparison.warnings.map((warning, i) => (
                <div key={i} className="warning">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
