import { formatCurrency } from "../../utils/calculations";
import "./MetricsGrid.css";

interface Metric {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  highlight?: "success" | "warning" | "danger";
}

interface MetricsGridProps {
  metrics: Metric[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`metric-card ${metric.highlight ? `highlight-${metric.highlight}` : ""}`}
        >
          <div className="metric-icon-wrapper">
            <span className="metric-icon">{metric.icon}</span>
          </div>
          <div className="metric-content">
            <span className="metric-label">{metric.label}</span>
            <span className="metric-value">{metric.value}</span>
            {metric.subtext && (
              <span
                className={`metric-subtext ${metric.trend ? `trend-${metric.trend}` : ""}`}
              >
                {metric.trend === "up" && " "}
                {metric.trend === "down" && " "}
                {metric.subtext}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Pre-built metric card configurations
interface QuickMetricsProps {
  loanAmount: number;
  totalInterest: number;
  effectiveRate: number;
  termMonths: number;
  dtiRatio?: number;
  downPaymentPercent: number;
  biWeeklySavings?: number;
  dealScore: number;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({
  loanAmount,
  totalInterest,
  effectiveRate,
  termMonths,
  dtiRatio,
  downPaymentPercent,
  biWeeklySavings,
  dealScore,
}) => {
  const metrics: Metric[] = [
    {
      icon: "",
      label: "Amount Financed",
      value: formatCurrency(loanAmount),
    },
    {
      icon: "",
      label: "Total Interest",
      value: formatCurrency(totalInterest),
      subtext: `${effectiveRate.toFixed(1)}% of principal`,
      highlight: totalInterest > loanAmount * 0.2 ? "warning" : undefined,
    },
    {
      icon: "",
      label: "Loan Term",
      value: `${termMonths} months`,
      subtext: `${(termMonths / 12).toFixed(1)} years`,
      highlight: termMonths > 60 ? "warning" : undefined,
    },
    {
      icon: "",
      label: "Down Payment",
      value: `${downPaymentPercent.toFixed(0)}%`,
      subtext: downPaymentPercent >= 20 ? "Meets 20% rule" : "Below 20%",
      highlight: downPaymentPercent >= 20 ? "success" : "warning",
    },
  ];

  if (dtiRatio !== undefined) {
    metrics.push({
      icon: "",
      label: "DTI Ratio",
      value: `${dtiRatio.toFixed(1)}%`,
      subtext:
        dtiRatio <= 10 ? "Healthy" : dtiRatio <= 15 ? "Moderate" : "High",
      highlight:
        dtiRatio <= 10 ? "success" : dtiRatio <= 15 ? "warning" : "danger",
    });
  }

  if (biWeeklySavings !== undefined && biWeeklySavings > 0) {
    metrics.push({
      icon: "",
      label: "Bi-weekly Savings",
      value: formatCurrency(biWeeklySavings),
      subtext: "Switch to bi-weekly",
      trend: "down",
      highlight: "success",
    });
  }

  metrics.push({
    icon: "",
    label: "Deal Score",
    value: `${dealScore}/100`,
    subtext:
      dealScore >= 70
        ? "Good Deal"
        : dealScore >= 50
          ? "Fair Deal"
          : "Review Terms",
    highlight:
      dealScore >= 70 ? "success" : dealScore >= 50 ? "warning" : "danger",
  });

  return <MetricsGrid metrics={metrics} />;
};
