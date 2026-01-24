import React, { useState, useMemo } from 'react';
import type { MonthlyBreakdown } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import './AmortizationTable.css';

interface AmortizationTableProps {
  schedule: MonthlyBreakdown[];
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('yearly');

  const yearlyData = useMemo(() => {
    if (viewMode === 'monthly') return null;
    
    const years: {
      year: number;
      totalPayment: number;
      totalPrincipal: number;
      totalInterest: number;
      endingBalance: number;
    }[] = [];
    
    for (let i = 0; i < schedule.length; i += 12) {
      const yearPayments = schedule.slice(i, Math.min(i + 12, schedule.length));
      const lastPayment = yearPayments[yearPayments.length - 1];
      
      years.push({
        year: Math.floor(i / 12) + 1,
        totalPayment: yearPayments.reduce((sum, p) => sum + p.payment, 0),
        totalPrincipal: yearPayments.reduce((sum, p) => sum + p.principal, 0),
        totalInterest: yearPayments.reduce((sum, p) => sum + p.interest, 0),
        endingBalance: lastPayment.balance
      });
    }
    
    return years;
  }, [schedule, viewMode]);

  if (schedule.length === 0) {
    return (
      <div className="amortization-empty">
        <p>Enter loan details to see the amortization schedule</p>
      </div>
    );
  }

  return (
    <div className="amortization-section">
      <div className="amortization-header">
        <h3 className="section-title">Amortization Schedule</h3>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'yearly' ? 'active' : ''}`}
            onClick={() => setViewMode('yearly')}
          >
            Yearly
          </button>
          <button
            className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="table-container">
        {viewMode === 'yearly' && yearlyData && (
          <table className="amort-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Payment</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((year) => (
                <tr key={year.year}>
                  <td className="year-cell">{year.year}</td>
                  <td>{formatCurrency(year.totalPayment)}</td>
                  <td className="principal">{formatCurrency(year.totalPrincipal)}</td>
                  <td className="interest">{formatCurrency(year.totalInterest)}</td>
                  <td>{formatCurrency(year.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {viewMode === 'monthly' && (
          <table className="amort-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Payment</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((month) => (
                <tr key={month.paymentNumber}>
                  <td className="month-cell">{month.paymentNumber}</td>
                  <td>{formatCurrency(month.payment)}</td>
                  <td className="principal">{formatCurrency(month.principal)}</td>
                  <td className="interest">{formatCurrency(month.interest)}</td>
                  <td>{formatCurrency(month.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
