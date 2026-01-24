import type { LoanSummary, BCTaxes, LoanInput } from "../types";
import { formatCurrency } from "../utils/calculations";
import "./ResultsPanel.css";

interface ResultsPanelProps {
  summary: LoanSummary;
  taxes: BCTaxes;
  input: LoanInput;
}

export function ResultsPanel({ summary, taxes, input }: ResultsPanelProps) {
  const totalOutTheDoor = taxes.priceWithTax;
  const totalFinancingCost = summary.totalPayment + input.downPayment;

  return (
    <div className="results-panel">
      <h2 className="results-title">
        <span className="results-icon">📋</span>
        Financing Summary
      </h2>

      <div className="results-grid">
        <div className="result-card primary">
          <div className="result-label">Monthly Payment</div>
          <div className="result-value large">
            {formatCurrency(summary.monthlyPayment)}
          </div>
          <div className="result-sublabel">
            per month for {input.termMonths} months
          </div>
        </div>

        <div className="result-card highlight">
          <div className="result-label">Total Interest Paid</div>
          <div className="result-value">
            {formatCurrency(summary.totalInterest)}
          </div>
          <div className="result-sublabel">
            {summary.effectiveRate.toFixed(1)}% of loan amount
          </div>
        </div>

        <div className="result-card">
          <div className="result-label">Loan Amount</div>
          <div className="result-value">
            {formatCurrency(summary.loanAmount)}
          </div>
          <div className="result-sublabel">After down payment</div>
        </div>

        <div className="result-card">
          <div className="result-label">Total of All Payments</div>
          <div className="result-value">
            {formatCurrency(summary.totalPayment)}
          </div>
          <div className="result-sublabel">Principal + Interest</div>
        </div>
      </div>

      <div className="taxes-section">
        <h3 className="section-subtitle">
          <span className="section-icon">🍁</span>
          BC Taxes
        </h3>

        <div className="tax-breakdown">
          <div className="tax-row">
            <span className="tax-label">Vehicle Price</span>
            <span className="tax-value">
              {formatCurrency(input.vehiclePrice)}
            </span>
          </div>
          {input.isNewVehicle && (
            <div className="tax-row">
              <span className="tax-label">GST (5%)</span>
              <span className="tax-value">{formatCurrency(taxes.gst)}</span>
            </div>
          )}
          <div className="tax-row">
            <span className="tax-label">BC PST</span>
            <span className="tax-value">{formatCurrency(taxes.pst)}</span>
          </div>
          <div className="tax-row total">
            <span className="tax-label">Total Taxes</span>
            <span className="tax-value">{formatCurrency(taxes.totalTax)}</span>
          </div>
          <div className="tax-row grand-total">
            <span className="tax-label">Out-the-Door Price</span>
            <span className="tax-value">{formatCurrency(totalOutTheDoor)}</span>
          </div>
        </div>
      </div>

      <div className="total-cost-section">
        <h3 className="section-subtitle">
          <span className="section-icon">💵</span>
          True Cost of Ownership
        </h3>

        <div className="cost-breakdown">
          <div className="cost-item">
            <span className="cost-label">Down Payment</span>
            <span className="cost-value">
              {formatCurrency(input.downPayment)}
            </span>
          </div>
          <div className="cost-item">
            <span className="cost-label">Total Loan Payments</span>
            <span className="cost-value">
              {formatCurrency(summary.totalPayment)}
            </span>
          </div>
          <div className="cost-item">
            <span className="cost-label">Taxes</span>
            <span className="cost-value">{formatCurrency(taxes.totalTax)}</span>
          </div>
          <div className="cost-item total">
            <span className="cost-label">Total Cost</span>
            <span className="cost-value">
              {formatCurrency(totalFinancingCost + taxes.totalTax)}
            </span>
          </div>
        </div>

        <div className="extra-cost-callout">
          <span className="callout-icon">💡</span>
          <span className="callout-text">
            You'll pay <strong>{formatCurrency(summary.totalInterest)}</strong>{" "}
            extra in interest over the life of this loan
          </span>
        </div>
      </div>
    </div>
  );
}
