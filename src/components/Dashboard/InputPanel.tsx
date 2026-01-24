import React, { useState } from "react";
import type { LoanInput } from "../../types";
import "./InputPanel.css";

interface InputPanelProps {
  input: LoanInput;
  onInputChange: (input: LoanInput) => void;
}

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible-section ${isOpen ? "open" : ""}`}>
      <button
        className="section-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
        <span className={`chevron ${isOpen ? "rotate" : ""}`}></span>
      </button>
      <div className={`section-content ${isOpen ? "expanded" : ""}`}>
        {children}
      </div>
    </div>
  );
};

export const InputPanel: React.FC<InputPanelProps> = ({
  input,
  onInputChange,
}) => {
  const handleChange = (
    field: keyof LoanInput,
    value: number | boolean | string | undefined,
  ) => {
    onInputChange({ ...input, [field]: value });
  };

  const termOptions = [24, 36, 48, 60, 72, 84];
  const drivetrain = input.drivetrain || "gas";
  const fuelEff = input.fuelEfficiencyLPer100km ?? 8.5;
  const electricEff = input.electricEfficiencyKWhPer100km ?? 19;
  const gasPrice = input.gasPricePerL ?? 1.85;
  const kWhPrice = input.electricityPricePerKWh ?? 0.15;
  const phevShare = input.phevElectricShare ?? 60;

  return (
    <div className="input-panel">
      <CollapsibleSection title="Vehicle Details" icon="" defaultOpen={true}>
        <div className="input-group">
          <label className="input-label">Vehicle Price</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.vehiclePrice}
              onChange={(e) =>
                handleChange("vehiclePrice", Number(e.target.value))
              }
              min={0}
              step={1000}
            />
          </div>
        </div>

        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Condition</label>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${input.isNewVehicle ? "active" : ""}`}
                onClick={() => handleChange("isNewVehicle", true)}
              >
                New
              </button>
              <button
                className={`toggle-btn ${!input.isNewVehicle ? "active" : ""}`}
                onClick={() => handleChange("isNewVehicle", false)}
              >
                Used
              </button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Energy & Efficiency"
        icon=""
        defaultOpen={true}
      >
        <div className="input-group">
          <label className="input-label">Drivetrain</label>
          <div className="toggle-buttons">
            <button
              className={`toggle-btn ${drivetrain === "gas" ? "active" : ""}`}
              onClick={() => handleChange("drivetrain", "gas")}
            >
              Gas
            </button>
            <button
              className={`toggle-btn ${drivetrain === "hybrid" ? "active" : ""}`}
              onClick={() => handleChange("drivetrain", "hybrid")}
            >
              Hybrid
            </button>
            <button
              className={`toggle-btn ${drivetrain === "phev" ? "active" : ""}`}
              onClick={() => handleChange("drivetrain", "phev")}
            >
              PHEV
            </button>
            <button
              className={`toggle-btn ${drivetrain === "ev" ? "active" : ""}`}
              onClick={() => handleChange("drivetrain", "ev")}
            >
              EV
            </button>
          </div>
          <span className="input-hint">
            Used to estimate fuel or electricity costs.
          </span>
        </div>

        {drivetrain !== "ev" && (
          <div className="input-group">
            <label className="input-label">Fuel Efficiency (L/100 km)</label>
            <input
              type="number"
              className="input-field"
              value={fuelEff}
              onChange={(e) =>
                handleChange("fuelEfficiencyLPer100km", Number(e.target.value))
              }
              min={3}
              max={25}
              step={0.1}
            />
          </div>
        )}

        {(drivetrain === "ev" || drivetrain === "phev") && (
          <div className="input-group">
            <label className="input-label">
              Electric Efficiency (kWh/100 km)
            </label>
            <input
              type="number"
              className="input-field"
              value={electricEff}
              onChange={(e) =>
                handleChange(
                  "electricEfficiencyKWhPer100km",
                  Number(e.target.value),
                )
              }
              min={10}
              max={35}
              step={0.5}
            />
          </div>
        )}

        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Gas Price ($/L)</label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="number"
                className="input-field"
                value={gasPrice}
                onChange={(e) =>
                  handleChange("gasPricePerL", Number(e.target.value))
                }
                min={0.5}
                max={5}
                step={0.01}
              />
            </div>
          </div>

          {(drivetrain === "ev" || drivetrain === "phev") && (
            <div className="input-group">
              <label className="input-label">Electricity Price ($/kWh)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="input-field"
                  value={kWhPrice}
                  onChange={(e) =>
                    handleChange(
                      "electricityPricePerKWh",
                      Number(e.target.value),
                    )
                  }
                  min={0.05}
                  max={0.5}
                  step={0.01}
                />
              </div>
            </div>
          )}
        </div>

        {drivetrain === "phev" && (
          <div className="input-group">
            <label className="input-label">PHEV Electric Driving (%)</label>
            <input
              type="range"
              className="slider-input"
              min={0}
              max={100}
              step={5}
              value={phevShare}
              onChange={(e) =>
                handleChange("phevElectricShare", Number(e.target.value))
              }
            />
            <span className="input-hint">{phevShare}% of km on electric</span>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Loan Details" icon="" defaultOpen={true}>
        <div className="input-group">
          <label className="input-label">Down Payment</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.downPayment}
              onChange={(e) =>
                handleChange("downPayment", Number(e.target.value))
              }
              min={0}
              step={500}
            />
          </div>
          <span className="input-hint">
            {((input.downPayment / input.vehiclePrice) * 100).toFixed(0)}% of
            price
          </span>
        </div>

        <div className="input-group">
          <label className="input-label">Interest Rate (APR)</label>
          <div className="input-with-suffix">
            <input
              type="number"
              className="input-field"
              value={input.annualRate}
              onChange={(e) =>
                handleChange("annualRate", Number(e.target.value))
              }
              min={0}
              max={30}
              step={0.25}
            />
            <span className="input-suffix">%</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Loan Term</label>
          <div className="term-selector">
            {termOptions.map((term) => (
              <button
                key={term}
                className={`term-option ${input.termMonths === term ? "active" : ""}`}
                onClick={() => handleChange("termMonths", term)}
              >
                {term} mo
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Trade-In (Optional)"
        icon=""
        defaultOpen={false}
      >
        <div className="input-group">
          <label className="input-label">Trade-In Value</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.tradeInValue || 0}
              onChange={(e) =>
                handleChange("tradeInValue", Number(e.target.value))
              }
              min={0}
              step={500}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Amount Owed on Trade-In</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.tradeInAmountOwed || 0}
              onChange={(e) =>
                handleChange("tradeInAmountOwed", Number(e.target.value))
              }
              min={0}
              step={500}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Cash Incentives/Rebates</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.cashIncentives || 0}
              onChange={(e) =>
                handleChange("cashIncentives", Number(e.target.value))
              }
              min={0}
              step={500}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Budget Analysis" icon="" defaultOpen={false}>
        <div className="input-group">
          <label className="input-label">Monthly Income (Gross)</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.monthlyIncome || 0}
              onChange={(e) =>
                handleChange("monthlyIncome", Number(e.target.value))
              }
              min={0}
              step={100}
            />
          </div>
          <span className="input-hint">Used for DTI calculation</span>
        </div>

        <div className="input-group">
          <label className="input-label">Est. Monthly Insurance</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.monthlyInsurance || 150}
              onChange={(e) =>
                handleChange("monthlyInsurance", Number(e.target.value))
              }
              min={0}
              step={25}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">
            Custom Monthly Energy Cost (optional)
          </label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="input-field"
              value={input.monthlyFuel ?? ""}
              placeholder="Auto-calculated"
              onChange={(e) =>
                handleChange(
                  "monthlyFuel",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
              min={0}
              step={25}
            />
          </div>
          <span className="input-hint">
            Leave blank to auto-calc from efficiency.
          </span>
        </div>

        <div className="input-group">
          <label className="input-label">Est. Annual Mileage (km)</label>
          <input
            type="number"
            className="input-field"
            value={input.estimatedMileagePerYear || 20000}
            onChange={(e) =>
              handleChange("estimatedMileagePerYear", Number(e.target.value))
            }
            min={0}
            step={1000}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};
