import type { DealAnalysis } from "../types";
import {
  getRatingColor,
  getRatingEmoji,
  getRatingLabel,
} from "../utils/dealRating";
import "./DealRatingPanel.css";

interface DealRatingPanelProps {
  analysis: DealAnalysis;
}

export function DealRatingPanel({ analysis }: DealRatingPanelProps) {
  const ratingColor = getRatingColor(analysis.rating);
  const ratingEmoji = getRatingEmoji(analysis.rating);
  const ratingLabel = getRatingLabel(analysis.rating);

  return (
    <div className="deal-rating-panel">
      <div className="rating-header" style={{ backgroundColor: ratingColor }}>
        <div className="rating-badge">
          <span className="rating-emoji">{ratingEmoji}</span>
          <span className="rating-label">{ratingLabel}</span>
        </div>
        <div className="rating-score">
          <span className="score-value">{analysis.score}</span>
          <span className="score-max">/100</span>
        </div>
      </div>

      {/* 20/4/10 Rule */}
      <div className="rule-section">
        <h3 className="rule-title">
          <span className="rule-icon">📏</span>
          The 20/4/10 Rule Check
        </h3>
        <p className="rule-description">
          Financial experts recommend: 20% down, 4-year max term, 10% of income
          max for car costs
        </p>

        <div className="rule-checks">
          <div
            className={`rule-check ${analysis.rule2410.downPaymentPassed ? "passed" : "failed"}`}
          >
            <span className="check-icon">
              {analysis.rule2410.downPaymentPassed ? "✅" : "❌"}
            </span>
            <div className="check-content">
              <span className="check-label">20% Down Payment</span>
              <span className="check-value">
                {analysis.rule2410.downPaymentPercent}%
                {analysis.rule2410.downPaymentPassed
                  ? " ✓ Passed"
                  : " - Need more"}
              </span>
            </div>
          </div>

          <div
            className={`rule-check ${analysis.rule2410.termPassed ? "passed" : "failed"}`}
          >
            <span className="check-icon">
              {analysis.rule2410.termPassed ? "✅" : "❌"}
            </span>
            <div className="check-content">
              <span className="check-label">4-Year (48mo) Max Term</span>
              <span className="check-value">
                {analysis.rule2410.termMonths} months
                {analysis.rule2410.termPassed ? " ✓ Passed" : " - Too long"}
              </span>
            </div>
          </div>

          {analysis.rule2410.carCostPercent !== undefined && (
            <div
              className={`rule-check ${analysis.rule2410.affordabilityPassed ? "passed" : "failed"}`}
            >
              <span className="check-icon">
                {analysis.rule2410.affordabilityPassed ? "✅" : "❌"}
              </span>
              <div className="check-content">
                <span className="check-label">10% of Income Max</span>
                <span className="check-value">
                  {analysis.rule2410.carCostPercent}% of income
                  {analysis.rule2410.affordabilityPassed
                    ? " ✓ Passed"
                    : " - Over budget"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rate Quality */}
      <div className="rate-section">
        <h3 className="section-title">
          <span className="section-icon">📊</span>
          Interest Rate Assessment
        </h3>

        <div className={`rate-quality rate-${analysis.rateQuality.quality}`}>
          <span className="rate-quality-label">
            {analysis.rateQuality.quality.toUpperCase()} RATE
          </span>
          <span className="rate-difference">
            {analysis.rateQuality.difference > 0 ? "+" : ""}
            {analysis.rateQuality.difference}% vs average
          </span>
        </div>

        <div className="ltv-dti">
          <div className="metric">
            <span className="metric-label">Loan-to-Value</span>
            <span className="metric-value">{analysis.ltvRatio}%</span>
          </div>
          {analysis.dtiRatio !== undefined && (
            <div className="metric">
              <span className="metric-label">Debt-to-Income</span>
              <span className="metric-value">{analysis.dtiRatio}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Reasons */}
      {analysis.reasons.length > 0 && (
        <div className="feedback-section good">
          <h4 className="feedback-title">
            <span className="feedback-icon">✅</span>
            What's Good
          </h4>
          <ul className="feedback-list">
            {analysis.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="feedback-section warning">
          <h4 className="feedback-title">
            <span className="feedback-icon">⚠️</span>
            Concerns
          </h4>
          <ul className="feedback-list">
            {analysis.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="feedback-section recommendation">
          <h4 className="feedback-title">
            <span className="feedback-icon">💡</span>
            Recommendations
          </h4>
          <ul className="feedback-list">
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
