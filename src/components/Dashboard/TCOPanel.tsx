import React from 'react';
import type { TotalCostOfOwnership, DepreciationForecast } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import './TCOPanel.css';

interface TCOPanelProps {
  tco: TotalCostOfOwnership;
  depreciation: DepreciationForecast[];
  vehiclePrice: number;
}

export const TCOPanel: React.FC<TCOPanelProps> = ({ tco, depreciation, vehiclePrice }) => {
  const costBreakdown = [
    { label: 'Loan Payment', value: tco.monthlyPayment, color: '#4CAF50', icon: '' },
    { label: 'Insurance', value: tco.insurance, color: '#2196F3', icon: '' },
    { label: 'Fuel', value: tco.fuel, color: '#FF9800', icon: '' },
    { label: 'Maintenance', value: tco.maintenance, color: '#9C27B0', icon: '' },
    { label: 'Depreciation', value: tco.depreciation, color: '#F44336', icon: '' },
  ];

  return (
    <div className="tco-panel">
      <div className="tco-header">
        <h3 className="tco-title">Total Cost of Ownership</h3>
        <p className="tco-subtitle">Real monthly cost of owning this vehicle</p>
      </div>

      <div className="tco-hero">
        <div className="tco-hero-amount">
          <span className="tco-currency">$</span>
          <span className="tco-value">{Math.round(tco.totalMonthly).toLocaleString()}</span>
          <span className="tco-period">/mo</span>
        </div>
        <div className="tco-hero-meta">
          <span className="meta-item">{formatCurrency(tco.totalAnnual)}/year</span>
          <span className="meta-divider"></span>
          <span className="meta-item">${tco.perMileCost.toFixed(2)}/km</span>
        </div>
      </div>

      <div className="cost-breakdown">
        <h4 className="breakdown-title">Monthly Breakdown</h4>
        {costBreakdown.map((item) => (
          <div key={item.label} className="cost-item">
            <div className="cost-item-left">
              <span className="cost-icon">{item.icon}</span>
              <span className="cost-label">{item.label}</span>
            </div>
            <div className="cost-item-right">
              <span className="cost-value">{formatCurrency(item.value)}</span>
              <div className="cost-bar">
                <div 
                  className="cost-bar-fill" 
                  style={{ 
                    width: `${(item.value / tco.totalMonthly) * 100}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="depreciation-section">
        <h4 className="breakdown-title">Depreciation Forecast</h4>
        <div className="depreciation-cards">
          {depreciation.slice(0, 5).map((year) => (
            <div key={year.year} className="depreciation-card">
              <span className="dep-year">Year {year.year}</span>
              <span className="dep-value">{formatCurrency(year.value)}</span>
              <span className="dep-percent">{year.percentRetained}% retained</span>
            </div>
          ))}
        </div>
        <div className="depreciation-summary">
          <div className="dep-stat">
            <span className="dep-stat-label">Total Depreciation</span>
            <span className="dep-stat-value loss">
              -{formatCurrency(depreciation[Math.min(4, depreciation.length - 1)]?.cumulativeDepreciation || 0)}
            </span>
          </div>
          <div className="dep-stat">
            <span className="dep-stat-label">Value After 5 Years</span>
            <span className="dep-stat-value">
              {formatCurrency(depreciation[Math.min(4, depreciation.length - 1)]?.value || vehiclePrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
