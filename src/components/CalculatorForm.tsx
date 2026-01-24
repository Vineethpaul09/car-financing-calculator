import React from "react";
import type { LoanInput } from "../types";
import "./CalculatorForm.css";

interface CalculatorFormProps {
  input: LoanInput;
  onChange: (input: LoanInput) => void;
  onCalculate: () => void;
  errors: string[];
}

export function CalculatorForm({
  input,
  onChange,
  onCalculate,
  errors,
}: CalculatorFormProps) {
  const handleChange = (field: keyof LoanInput, value: number | boolean) => {
    onChange({ ...input, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate();
  };

  return (
    <form className="calculator-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">🚗</span>
          Vehicle Details
        </h2>

        <div className="form-group">
          <label htmlFor="vehiclePrice" className="form-label">
            Vehicle Price (CAD)
          </label>
          <div className="input-wrapper">
            <span className="input-prefix">$</span>
            <input
              type="number"
              id="vehiclePrice"
              className="form-input"
              value={input.vehiclePrice || ""}
              onChange={(e) =>
                handleChange("vehiclePrice", parseFloat(e.target.value) || 0)
              }
              placeholder="35,000"
              min="1000"
              max="500000"
              step="100"
              aria-describedby="vehiclePrice-help"
            />
          </div>
          <small id="vehiclePrice-help" className="form-help">
            Enter the total vehicle price before taxes
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle Type</label>
          <div
            className="radio-group"
            role="radiogroup"
            aria-label="Vehicle type"
          >
            <label
              className={`radio-option ${input.isNewVehicle ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="vehicleType"
                checked={input.isNewVehicle}
                onChange={() => handleChange("isNewVehicle", true)}
              />
              <span className="radio-label">🆕 New Vehicle</span>
            </label>
            <label
              className={`radio-option ${!input.isNewVehicle ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="vehicleType"
                checked={!input.isNewVehicle}
                onChange={() => handleChange("isNewVehicle", false)}
              />
              <span className="radio-label">🔄 Used Vehicle</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">💰</span>
          Loan Details
        </h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="downPayment" className="form-label">
              Down Payment (CAD)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="downPayment"
                className="form-input"
                value={input.downPayment || ""}
                onChange={(e) =>
                  handleChange("downPayment", parseFloat(e.target.value) || 0)
                }
                placeholder="7,000"
                min="0"
                step="100"
              />
            </div>
            {input.vehiclePrice > 0 && (
              <small className="form-help">
                {((input.downPayment / input.vehiclePrice) * 100).toFixed(1)}%
                of vehicle price
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="annualRate" className="form-label">
              Interest Rate (% APR)
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                id="annualRate"
                className="form-input"
                value={input.annualRate || ""}
                onChange={(e) =>
                  handleChange("annualRate", parseFloat(e.target.value) || 0)
                }
                placeholder="6.99"
                min="0"
                max="30"
                step="0.01"
              />
              <span className="input-suffix">%</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="termMonths" className="form-label">
            Loan Term (Months)
          </label>
          <div
            className="term-buttons"
            role="group"
            aria-label="Loan term selection"
          >
            {[24, 36, 48, 60, 72, 84].map((term) => (
              <button
                key={term}
                type="button"
                className={`term-button ${input.termMonths === term ? "selected" : ""}`}
                onClick={() => handleChange("termMonths", term)}
                aria-pressed={input.termMonths === term}
              >
                {term}mo
                <span className="term-years">({term / 12}yr)</span>
              </button>
            ))}
          </div>
          <input
            type="range"
            id="termMonths"
            className="term-slider"
            value={input.termMonths}
            onChange={(e) =>
              handleChange("termMonths", parseInt(e.target.value))
            }
            min="12"
            max="96"
            step="12"
            aria-label="Loan term slider"
          />
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">📊</span>
          Budget Analysis (Optional)
        </h2>
        <p className="form-section-desc">
          Enter your income to check if this purchase follows the 20/4/10 rule
        </p>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="monthlyIncome" className="form-label">
              Gross Monthly Income
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="monthlyIncome"
                className="form-input"
                value={input.monthlyIncome || ""}
                onChange={(e) =>
                  handleChange("monthlyIncome", parseFloat(e.target.value) || 0)
                }
                placeholder="5,000"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="monthlyInsurance" className="form-label">
              Est. Monthly Insurance
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="monthlyInsurance"
                className="form-input"
                value={input.monthlyInsurance || ""}
                onChange={(e) =>
                  handleChange(
                    "monthlyInsurance",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="200"
                min="0"
                step="10"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="monthlyFuel" className="form-label">
              Est. Monthly Fuel
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="monthlyFuel"
                className="form-input"
                value={input.monthlyFuel || ""}
                onChange={(e) =>
                  handleChange("monthlyFuel", parseFloat(e.target.value) || 0)
                }
                placeholder="150"
                min="0"
                step="10"
              />
            </div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="form-errors" role="alert">
          <h3>⚠️ Please fix the following:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" className="calculate-button">
        <span className="button-icon">🧮</span>
        Calculate My Financing
      </button>
    </form>
  );
}
