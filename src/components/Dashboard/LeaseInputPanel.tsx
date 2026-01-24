import { useState } from "react";
import type { LeaseInput } from "../../types";
import { moneyFactorToAPR, aprToMoneyFactor } from "../../utils/calculations";
import "./LeaseInputPanel.css";

interface LeaseInputPanelProps {
  input: LeaseInput;
  onChange: (input: LeaseInput) => void;
}

export default function LeaseInputPanel({
  input,
  onChange,
}: LeaseInputPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aprInput, setAprInput] = useState(
    moneyFactorToAPR(input.moneyFactor).toString(),
  );

  const handleChange = (field: keyof LeaseInput, value: number) => {
    onChange({ ...input, [field]: value });
  };

  const handleAPRChange = (aprValue: string) => {
    setAprInput(aprValue);
    const apr = parseFloat(aprValue);
    if (!isNaN(apr) && apr >= 0) {
      handleChange("moneyFactor", aprToMoneyFactor(apr));
    }
  };

  const handleMoneyFactorChange = (mfValue: string) => {
    const mf = parseFloat(mfValue);
    if (!isNaN(mf) && mf >= 0) {
      handleChange("moneyFactor", mf);
      setAprInput(moneyFactorToAPR(mf).toString());
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(value);

  const residualDollars = (input.msrp * input.residualPercent) / 100;

  return (
    <div className="lease-input-panel">
      <div className="lease-section">
        <h3>
          <span className="section-icon">🚗</span>
          Vehicle Information
        </h3>
        <div className="input-row">
          <label>
            MSRP (Sticker Price)
            <span className="input-hint">Used to calculate residual value</span>
          </label>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.msrp || ""}
              onChange={(e) =>
                handleChange("msrp", parseFloat(e.target.value) || 0)
              }
              placeholder="45000"
            />
          </div>
        </div>

        <div className="input-row">
          <label>
            Negotiated Price (Cap Cost)
            <span className="input-hint">
              This is negotiable - don't pay MSRP!
            </span>
          </label>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.negotiatedPrice || ""}
              onChange={(e) =>
                handleChange("negotiatedPrice", parseFloat(e.target.value) || 0)
              }
              placeholder="43000"
              className={input.negotiatedPrice >= input.msrp ? "warning" : ""}
            />
          </div>
          {input.negotiatedPrice >= input.msrp && input.msrp > 0 && (
            <span className="field-warning">💡 Try negotiating below MSRP</span>
          )}
        </div>
      </div>

      <div className="lease-section">
        <h3>
          <span className="section-icon">📊</span>
          Lease Terms
        </h3>

        <div className="input-row">
          <label>Lease Term</label>
          <div className="term-buttons">
            {[24, 36, 48].map((term) => (
              <button
                key={term}
                type="button"
                className={`term-btn ${input.termMonths === term ? "active" : ""}`}
                onClick={() => handleChange("termMonths", term)}
              >
                {term} mo
              </button>
            ))}
          </div>
        </div>

        <div className="input-row">
          <label>
            Residual Value
            <span className="input-hint">
              % of MSRP at lease end = {formatCurrency(residualDollars)}
            </span>
          </label>
          <div className="input-with-suffix">
            <input
              type="number"
              value={input.residualPercent || ""}
              onChange={(e) =>
                handleChange("residualPercent", parseFloat(e.target.value) || 0)
              }
              placeholder="55"
              min={30}
              max={75}
              step={1}
            />
            <span className="suffix">%</span>
          </div>
          <div className="residual-quality">
            {input.residualPercent >= 58 && (
              <span className="quality excellent">Excellent</span>
            )}
            {input.residualPercent >= 52 && input.residualPercent < 58 && (
              <span className="quality good">Good</span>
            )}
            {input.residualPercent >= 45 && input.residualPercent < 52 && (
              <span className="quality fair">Fair</span>
            )}
            {input.residualPercent < 45 && (
              <span className="quality poor">Low</span>
            )}
          </div>
        </div>

        <div className="input-row money-factor-row">
          <label>
            Interest Rate
            <span className="input-hint">Enter as APR % or Money Factor</span>
          </label>
          <div className="dual-input">
            <div className="input-with-suffix">
              <input
                type="number"
                value={aprInput}
                onChange={(e) => handleAPRChange(e.target.value)}
                placeholder="4.0"
                step={0.1}
                min={0}
                max={20}
              />
              <span className="suffix">% APR</span>
            </div>
            <span className="or-divider">or</span>
            <div className="input-with-prefix">
              <span className="prefix">MF</span>
              <input
                type="number"
                value={input.moneyFactor || ""}
                onChange={(e) => handleMoneyFactorChange(e.target.value)}
                placeholder="0.00167"
                step={0.00001}
                min={0}
                max={0.01}
              />
            </div>
          </div>
          <div className="rate-quality">
            {moneyFactorToAPR(input.moneyFactor) <= 3 && (
              <span className="quality excellent">Excellent Rate</span>
            )}
            {moneyFactorToAPR(input.moneyFactor) > 3 &&
              moneyFactorToAPR(input.moneyFactor) <= 5 && (
                <span className="quality good">Good Rate</span>
              )}
            {moneyFactorToAPR(input.moneyFactor) > 5 &&
              moneyFactorToAPR(input.moneyFactor) <= 7 && (
                <span className="quality fair">Average Rate</span>
              )}
            {moneyFactorToAPR(input.moneyFactor) > 7 && (
              <span className="quality poor">High Rate - Negotiate!</span>
            )}
          </div>
        </div>
      </div>

      <div className="lease-section">
        <h3>
          <span className="section-icon">🛣️</span>
          Mileage
        </h3>

        <div className="input-row">
          <label>Annual Mileage Allowance</label>
          <div className="mileage-buttons">
            {[16000, 20000, 24000].map((km) => (
              <button
                key={km}
                type="button"
                className={`mileage-btn ${input.annualMileageAllowance === km ? "active" : ""}`}
                onClick={() => handleChange("annualMileageAllowance", km)}
              >
                {(km / 1000).toFixed(0)}k km
              </button>
            ))}
            <div className="input-with-suffix custom-mileage">
              <input
                type="number"
                value={input.annualMileageAllowance || ""}
                onChange={(e) =>
                  handleChange(
                    "annualMileageAllowance",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="Custom"
              />
              <span className="suffix">km/yr</span>
            </div>
          </div>
        </div>

        <div className="input-row">
          <label>
            Your Expected Annual Driving
            <span className="input-hint">
              Be honest - excess km fees add up!
            </span>
          </label>
          <div className="input-with-suffix">
            <input
              type="number"
              value={input.estimatedMileagePerYear || ""}
              onChange={(e) =>
                handleChange(
                  "estimatedMileagePerYear",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="20000"
            />
            <span className="suffix">km/yr</span>
          </div>
          {input.estimatedMileagePerYear > input.annualMileageAllowance && (
            <span className="field-warning">
              ⚠️{" "}
              {(
                input.estimatedMileagePerYear - input.annualMileageAllowance
              ).toLocaleString()}{" "}
              km/yr over limit
            </span>
          )}
        </div>

        <div className="input-row">
          <label>Excess Mileage Fee</label>
          <div className="input-with-prefix-suffix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.excessMileageFee || ""}
              onChange={(e) =>
                handleChange(
                  "excessMileageFee",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0.15"
              step={0.01}
              min={0.05}
              max={0.5}
            />
            <span className="suffix">/km</span>
          </div>
        </div>
      </div>

      <div className="lease-section">
        <h3>
          <span className="section-icon">💰</span>
          Payments & Trade-In
        </h3>

        <div className="input-row">
          <label>
            Down Payment (Cap Reduction)
            <span className="input-hint">
              Reduces monthly payment but you lose it if totaled
            </span>
          </label>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.downPayment || ""}
              onChange={(e) =>
                handleChange("downPayment", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
            />
          </div>
          {input.downPayment > 3000 && (
            <span className="field-warning">
              💡 Consider lower down payment - gap insurance implications
            </span>
          )}
        </div>

        <div className="input-row">
          <label>Trade-In Value</label>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.tradeInValue || ""}
              onChange={(e) =>
                handleChange("tradeInValue", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
            />
          </div>
        </div>

        <div className="input-row">
          <label>Amount Owed on Trade-In</label>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.tradeInAmountOwed || ""}
              onChange={(e) =>
                handleChange(
                  "tradeInAmountOwed",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0"
            />
          </div>
          {input.tradeInAmountOwed > input.tradeInValue &&
            input.tradeInValue > 0 && (
              <span className="field-warning">
                ⚠️ Negative equity will be added to cap cost
              </span>
            )}
        </div>

        <div className="input-row">
          <label>
            Lease Rebates & Incentives
            <span className="input-hint">
              Manufacturer lease cash, loyalty bonus, etc.
            </span>
          </label>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.rebatesAndIncentives || ""}
              onChange={(e) =>
                handleChange(
                  "rebatesAndIncentives",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0"
            />
          </div>
          {input.rebatesAndIncentives > 0 && (
            <span className="field-success">✓ Reduces cap cost</span>
          )}
        </div>

        <div className="input-row">
          <label>
            Security Deposit
            <span className="input-hint">
              Refundable at lease end (often waived)
            </span>
          </label>
          <div className="input-with-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              value={input.securityDeposit || ""}
              onChange={(e) =>
                handleChange("securityDeposit", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
            />
          </div>
          {input.securityDeposit > 0 && (
            <span className="field-info">
              ℹ️ Refunded if no damage at return
            </span>
          )}
        </div>
      </div>

      <div className="lease-section collapsible">
        <button
          type="button"
          className="section-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="section-icon">⚙️</span>
          <span>Fees & Advanced</span>
          <span className={`toggle-arrow ${showAdvanced ? "open" : ""}`}>
            ▼
          </span>
        </button>

        {showAdvanced && (
          <div className="advanced-inputs">
            <div className="input-row">
              <label>
                Acquisition Fee
                <span className="input-hint">
                  Lessor's origination fee (non-negotiable)
                </span>
              </label>
              <div className="input-with-prefix">
                <span className="prefix">$</span>
                <input
                  type="number"
                  value={input.acquisitionFee || ""}
                  onChange={(e) =>
                    handleChange(
                      "acquisitionFee",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="595"
                />
              </div>
            </div>

            <div className="input-row">
              <label>
                Disposition Fee
                <span className="input-hint">
                  Charged at lease end if returning car
                </span>
              </label>
              <div className="input-with-prefix">
                <span className="prefix">$</span>
                <input
                  type="number"
                  value={input.dispositionFee || ""}
                  onChange={(e) =>
                    handleChange(
                      "dispositionFee",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="395"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
