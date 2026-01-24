import { CREDIT_TIERS } from "../utils/dealRating";
import "./CreditTierInfo.css";

export function CreditTierInfo() {
  return (
    <div className="credit-tier-info">
      <h3 className="tier-title">
        <span className="tier-icon">📈</span>
        Canadian Auto Loan Rate Guide
      </h3>
      <p className="tier-subtitle">
        Interest rates vary by credit score. Know your rate before you go!
      </p>

      <div className="tier-table-wrapper">
        <table className="tier-table">
          <thead>
            <tr>
              <th>Credit Tier</th>
              <th>Score Range</th>
              <th>New Vehicle</th>
              <th>Used Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {CREDIT_TIERS.map((tier) => (
              <tr key={tier.name} className={`tier-${tier.name.toLowerCase()}`}>
                <td>
                  <span className="tier-name">{tier.name}</span>
                </td>
                <td>
                  <span className="tier-score">{tier.scoreRange}</span>
                </td>
                <td>
                  <span className="tier-rate">
                    {tier.newRateRange.min}% - {tier.newRateRange.max}%
                  </span>
                </td>
                <td>
                  <span className="tier-rate">
                    {tier.usedRateRange.min}% - {tier.usedRateRange.max}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tier-tips">
        <h4>💡 Tips for Getting Better Rates:</h4>
        <ul>
          <li>
            Get pre-approved from your bank or credit union before visiting
            dealerships
          </li>
          <li>Check your credit score at Equifax or TransUnion Canada</li>
          <li>Compare rates from at least 3 different sources</li>
          <li>
            Manufacturer financing (0-2.99%) is available on select new models
          </li>
        </ul>
      </div>
    </div>
  );
}
