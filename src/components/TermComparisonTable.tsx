import type { TermComparison } from "../types";
import { formatCurrency } from "../utils/calculations";
import "./TermComparisonTable.css";

interface TermComparisonTableProps {
  comparisons: TermComparison[];
  currentTerm: number;
  onSelectTerm: (term: number) => void;
}

export function TermComparisonTable({
  comparisons,
  currentTerm,
  onSelectTerm,
}: TermComparisonTableProps) {
  const renderStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="term-comparison">
      <h3 className="comparison-title">
        <span className="comparison-icon">📊</span>
        Compare Loan Terms
      </h3>
      <p className="comparison-subtitle">
        See how different loan terms affect your payments and total cost
      </p>

      <div className="comparison-table-wrapper">
        <table className="comparison-table" role="grid">
          <thead>
            <tr>
              <th scope="col">Term</th>
              <th scope="col">Monthly</th>
              <th scope="col">Total Interest</th>
              <th scope="col">Total Cost</th>
              <th scope="col">Rating</th>
              <th scope="col" className="action-col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comp) => (
              <tr
                key={comp.termMonths}
                className={comp.termMonths === currentTerm ? "selected" : ""}
                aria-selected={comp.termMonths === currentTerm}
              >
                <td data-label="Term">
                  <span className="term-value">{comp.termMonths}mo</span>
                  <span className="term-years">({comp.termMonths / 12}yr)</span>
                </td>
                <td data-label="Monthly" className="currency">
                  {formatCurrency(comp.monthlyPayment)}
                </td>
                <td data-label="Interest" className="currency interest">
                  {formatCurrency(comp.totalInterest)}
                </td>
                <td data-label="Total" className="currency">
                  {formatCurrency(comp.totalCost)}
                </td>
                <td data-label="Rating" className="rating">
                  <span
                    className="stars"
                    aria-label={`${comp.rating} out of 5 stars`}
                  >
                    {renderStars(comp.rating)}
                  </span>
                </td>
                <td data-label="Action" className="action-col">
                  {comp.termMonths === currentTerm ? (
                    <span className="current-badge">Current</span>
                  ) : (
                    <button
                      className="select-term-btn"
                      onClick={() => onSelectTerm(comp.termMonths)}
                      aria-label={`Select ${comp.termMonths} month term`}
                    >
                      Select
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="comparison-legend">
        <div className="legend-item">
          <span className="legend-stars">⭐⭐⭐⭐⭐</span>
          <span className="legend-text">Best value</span>
        </div>
        <div className="legend-item">
          <span className="legend-stars">⭐⭐⭐</span>
          <span className="legend-text">Acceptable</span>
        </div>
        <div className="legend-item">
          <span className="legend-stars">⭐⭐</span>
          <span className="legend-text">Caution</span>
        </div>
      </div>
    </div>
  );
}
