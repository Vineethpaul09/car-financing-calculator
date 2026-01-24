import React from 'react';
import type { AffordabilityStatus } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import './HeroPaymentCard.css';

interface HeroPaymentCardProps {
  monthlyPayment: number;
  term: number;
  totalCost: number;
  totalInterest: number;
  affordabilityStatus: AffordabilityStatus;
  payoffDate: Date;
}

export const HeroPaymentCard: React.FC<HeroPaymentCardProps> = ({
  monthlyPayment,
  term,
  totalCost,
  totalInterest,
  affordabilityStatus,
  payoffDate
}) => {
  const getStatusLabel = () => {
    switch (affordabilityStatus) {
      case 'good': return { icon: '', text: 'Affordable', class: 'good' };
      case 'warning': return { icon: '', text: 'Stretching Budget', class: 'warning' };
      case 'danger': return { icon: '', text: 'Over Budget', class: 'danger' };
    }
  };

  const status = getStatusLabel();

  return (
    <div className="hero-payment-card">
      <div className="hero-glow"></div>
      <span className="hero-eyebrow">Monthly Payment</span>
      
      <div className="hero-payment">
        <span className="currency">$</span>
        <span className="amount">
          {monthlyPayment.toLocaleString('en-CA', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 0 
          })}
        </span>
        <span className="period">/mo</span>
      </div>
      
      <div className={`status-pill status-${status.class}`}>
        <span className="status-icon">{status.icon}</span>
        {status.text}
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <span className="stat-value">{formatCurrency(totalCost)}</span>
          <span className="stat-label">Total Cost</span>
        </div>
        <div className="hero-stat-divider"></div>
        <div className="hero-stat">
          <span className="stat-value">{formatCurrency(totalInterest)}</span>
          <span className="stat-label">Interest</span>
        </div>
        <div className="hero-stat-divider"></div>
        <div className="hero-stat">
          <span className="stat-value">{term} mo</span>
          <span className="stat-label">Term</span>
        </div>
      </div>

      <div className="hero-payoff">
        <span className="payoff-icon"></span>
        Paid off by {payoffDate.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
};
