import React from 'react';
import type { TermComparison } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import './TermComparisonCards.css';

interface TermComparisonCardsProps {
  comparisons: TermComparison[];
  selectedTerm: number;
  onSelectTerm: (term: number) => void;
}

export const TermComparisonCards: React.FC<TermComparisonCardsProps> = ({
  comparisons,
  selectedTerm,
  onSelectTerm
}) => {
  return (
    <div className="term-comparison-section">
      <h3 className="section-title">Compare Loan Terms</h3>
      <p className="section-subtitle">Swipe to compare different term lengths</p>
      
      <div className="term-cards-scroll">
        <div className="term-cards-container">
          {comparisons.map((term) => (
            <div
              key={term.termMonths}
              className={`term-card ${term.termMonths === selectedTerm ? 'selected' : ''} ${term.isRecommended ? 'recommended' : ''}`}
              onClick={() => onSelectTerm(term.termMonths)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectTerm(term.termMonths)}
            >
              {term.isRecommended && (
                <span className="recommended-badge">Best Value</span>
              )}
              
              <div className="term-header">
                <span className="term-months">{term.termMonths}</span>
                <span className="term-label">months</span>
              </div>
              
              <div className="term-payment">
                <span className="payment-amount">{formatCurrency(term.monthlyPayment)}</span>
                <span className="payment-label">/month</span>
              </div>
              
              <div className="term-details">
                <div className="term-detail">
                  <span className="detail-label">Interest</span>
                  <span className="detail-value">{formatCurrency(term.totalInterest)}</span>
                </div>
                <div className="term-detail">
                  <span className="detail-label">Total</span>
                  <span className="detail-value">{formatCurrency(term.totalCost)}</span>
                </div>
              </div>
              
              <div className="term-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`star ${i < term.rating ? 'filled' : ''}`}>
                    
                  </span>
                ))}
              </div>
              
              {term.termMonths === selectedTerm && (
                <button className="select-btn selected-btn">Selected</button>
              )}
              {term.termMonths !== selectedTerm && (
                <button className="select-btn">Select</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
