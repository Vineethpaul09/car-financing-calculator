import type { BiWeeklyComparison } from "../types";
import { formatCurrency } from "../utils/calculations";
import "./BiWeeklySavings.css";

interface BiWeeklySavingsProps {
  comparison: BiWeeklyComparison;
}

export function BiWeeklySavings({ comparison }: BiWeeklySavingsProps) {
  if (comparison.interestSaved <= 0) return null;

  return (
    <div className="biweekly-savings">
      <h3 className="savings-title">
        <span className="savings-icon">💡</span>
        Bi-Weekly Payment Tip
      </h3>

      <div className="savings-content">
        <p className="savings-description">
          By paying{" "}
          <strong>{formatCurrency(comparison.biWeeklyPayment)}</strong> every 2
          weeks instead of{" "}
          <strong>{formatCurrency(comparison.monthlyPayment)}</strong> monthly,
          you could:
        </p>

        <div className="savings-benefits">
          <div className="benefit">
            <span className="benefit-icon">💰</span>
            <div className="benefit-text">
              <span className="benefit-label">Save in Interest</span>
              <span className="benefit-value">
                {formatCurrency(comparison.interestSaved)}
              </span>
            </div>
          </div>

          <div className="benefit">
            <span className="benefit-icon">⏱️</span>
            <div className="benefit-text">
              <span className="benefit-label">Pay Off Earlier</span>
              <span className="benefit-value">
                {comparison.monthsSaved} months
              </span>
            </div>
          </div>
        </div>

        <p className="savings-explanation">
          <strong>How it works:</strong> 26 bi-weekly payments = 13 monthly
          payments per year, effectively making one extra payment annually!
        </p>
      </div>
    </div>
  );
}
