import React from 'react';
import { formatCurrency } from '../../utils/calculations';
import './DonutChart.css';

interface DonutChartProps {
  principal: number;
  interest: number;
  taxes?: number;
  downPayment?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  principal,
  interest,
  taxes = 0,
  downPayment = 0
}) => {
  const total = principal + interest + taxes + downPayment;
  
  // Calculate percentages
  const principalPercent = (principal / total) * 100;
  const interestPercent = (interest / total) * 100;
  const taxesPercent = (taxes / total) * 100;
  const downPaymentPercent = (downPayment / total) * 100;

  // SVG calculations (circumference = 2 * PI * radius)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dasharray for each segment
  const principalDash = (principalPercent / 100) * circumference;
  const interestDash = (interestPercent / 100) * circumference;
  const taxesDash = (taxesPercent / 100) * circumference;
  const downPaymentDash = (downPaymentPercent / 100) * circumference;

  // Calculate stroke dashoffset for each segment (cumulative)
  const principalOffset = 0;
  const interestOffset = -principalDash;
  const taxesOffset = -(principalDash + interestDash);
  const downPaymentOffset = -(principalDash + interestDash + taxesDash);

  const segments = [
    { name: 'Principal', value: principal, percent: principalPercent, color: '#4CAF50', dash: principalDash, offset: principalOffset },
    { name: 'Interest', value: interest, percent: interestPercent, color: '#FF7043', dash: interestDash, offset: interestOffset },
  ];

  if (taxes > 0) {
    segments.push({ name: 'Taxes', value: taxes, percent: taxesPercent, color: '#42A5F5', dash: taxesDash, offset: taxesOffset });
  }
  
  if (downPayment > 0) {
    segments.push({ name: 'Down Payment', value: downPayment, percent: downPaymentPercent, color: '#AB47BC', dash: downPaymentDash, offset: downPaymentOffset });
  }

  return (
    <div className="donut-chart-container">
      <div className="donut-chart-wrapper">
        <svg viewBox="0 0 200 200" className="donut-svg">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--chart-bg, #E5E7EB)"
            strokeWidth="24"
          />
          
          {/* Segments */}
          {segments.map((segment, index) => (
            <circle
              key={segment.name}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="24"
              strokeDasharray={`${segment.dash} ${circumference}`}
              strokeDashoffset={segment.offset}
              strokeLinecap="butt"
              transform="rotate(-90 100 100)"
              className="donut-segment"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}

          {/* Center text */}
          <text x="100" y="92" textAnchor="middle" className="donut-center-label">
            Total
          </text>
          <text x="100" y="115" textAnchor="middle" className="donut-center-value">
            {formatCurrency(total)}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {segments.map((segment) => (
          <div key={segment.name} className="legend-item">
            <span 
              className="legend-dot" 
              style={{ backgroundColor: segment.color }}
            />
            <div className="legend-content">
              <span className="legend-label">{segment.name}</span>
              <span className="legend-value">{formatCurrency(segment.value)}</span>
              <span className="legend-percent">{segment.percent.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible table for screen readers */}
      <table className="sr-only">
        <caption>Payment breakdown</caption>
        <thead>
          <tr><th>Category</th><th>Amount</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment.name}>
              <td>{segment.name}</td>
              <td>{formatCurrency(segment.value)}</td>
              <td>{segment.percent.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
