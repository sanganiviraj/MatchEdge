import React from 'react';
import { Sliders, RotateCcw, Calculator } from 'lucide-react';
import type { MarketType, AllocationMode, OutcomeInput, ValidationErrors } from '../types/arbitrage';

interface MatchInputSectionProps {
  marketType: MarketType;
  allocationMode: AllocationMode;
  totalAmount: number | '';
  maxStakePerId: number | '';
  outcomesInput: OutcomeInput[];
  errors: ValidationErrors;
  onMarketTypeChange: (mode: MarketType) => void;
  onAllocationModeChange: (mode: AllocationMode) => void;
  onTotalAmountChange: (val: number | '') => void;
  onMaxStakeChange: (val: number | '') => void;
  onOddsChange: (id: 'HOME' | 'DRAW' | 'AWAY', oddsVal: number | '') => void;
  onTeamNameChange: (id: 'HOME' | 'DRAW' | 'AWAY', name: string) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export const MatchInputSection: React.FC<MatchInputSectionProps> = ({
  marketType,
  allocationMode,
  totalAmount,
  maxStakePerId,
  outcomesInput,
  errors,
  onMarketTypeChange,
  onAllocationModeChange,
  onTotalAmountChange,
  onMaxStakeChange,
  onOddsChange,
  onTeamNameChange,
  onCalculate,
  onReset,
}) => {
  const homeInput = outcomesInput.find((o) => o.id === 'HOME');
  const drawInput = outcomesInput.find((o) => o.id === 'DRAW');
  const awayInput = outcomesInput.find((o) => o.id === 'AWAY');

  return (
    <section className="card-panel config-panel">
      <div className="card-panel-header">
        <div className="panel-title-group">
          <Sliders size={18} className="text-blue" />
          <h2 className="panel-heading">Match & Market Configuration</h2>
        </div>

        <div className="header-actions-group">
          <div className="segmented-control">
            <button
              type="button"
              className={`seg-btn ${marketType === '2WAY' ? 'active' : ''}`}
              onClick={() => onMarketTypeChange('2WAY')}
            >
              2-Way Market
            </button>
            <button
              type="button"
              className={`seg-btn ${marketType === '3WAY' ? 'active' : ''}`}
              onClick={() => onMarketTypeChange('3WAY')}
            >
              3-Way Market (1X2)
            </button>
          </div>
        </div>
      </div>

      <div className="config-form-body">
        <div className="form-grid-4">
          <div className="form-field">
            <label className="field-label">
              Total Target Investment
              <span className="field-required">*</span>
            </label>
            <div className="input-affix-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                step="500"
                min="100"
                className={`text-input input-with-prefix ${errors.totalAmount ? 'input-error' : ''}`}
                value={totalAmount}
                onChange={(e) =>
                  onTotalAmountChange(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder="10000"
              />
            </div>
            {errors.totalAmount && <span className="field-error-text">{errors.totalAmount}</span>}
          </div>

          <div className="form-field">
            <label className="field-label">
              Max Stake Per ID
              <span className="field-required">*</span>
            </label>
            <div className="input-affix-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                step="10"
                min="1"
                className={`text-input input-with-prefix ${errors.maxStakePerId ? 'input-error' : ''}`}
                value={maxStakePerId}
                onChange={(e) =>
                  onMaxStakeChange(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder="100"
              />
            </div>
            {errors.maxStakePerId && <span className="field-error-text">{errors.maxStakePerId}</span>}
          </div>

          <div className="form-field span-2-col">
            <label className="field-label">Stake Distribution Strategy</label>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-toggle-btn ${allocationMode === 'EXACT' ? 'active-mode' : ''}`}
                onClick={() => onAllocationModeChange('EXACT')}
              >
                <div className="mode-btn-title">Mode 1 — Exact Stake</div>
                <div className="mode-btn-sub">Exact mathematical stakes (e.g. $1,250)</div>
              </button>

              <button
                type="button"
                className={`mode-toggle-btn ${allocationMode === 'FULL_UNITS' ? 'active-mode' : ''}`}
                onClick={() => onAllocationModeChange('FULL_UNITS')}
              >
                <div className="mode-btn-title">Mode 2 — Full ${maxStakePerId || 100} Units</div>
                <div className="mode-btn-sub">Rounds up to full units (e.g. $1,300)</div>
              </button>
            </div>
          </div>
        </div>

        <div className="odds-input-section">
          <div className="section-label-row">
            <span className="sub-heading">Decimal Odds Entry</span>
            <span className="sub-heading-info">Enter raw decimal odds from bookmaker listings</span>
          </div>

          <div className={`odds-grid ${marketType === '3WAY' ? 'grid-3-col' : 'grid-2-col'}`}>
            {homeInput && (
              <div className="odds-card">
                <div className="odds-card-header">
                  <span className="outcome-badge badge-home">Team A (Home)</span>
                  <input
                    type="text"
                    className="name-edit-input"
                    value={homeInput.label}
                    onChange={(e) => onTeamNameChange('HOME', e.target.value)}
                    placeholder="Team A Name"
                  />
                </div>
                <div className="odds-card-body">
                  <label className="field-label-sm">Decimal Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    className={`odds-number-input ${errors.homeOdds ? 'input-error' : ''}`}
                    value={homeInput.odds}
                    onChange={(e) =>
                      onOddsChange('HOME', e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="2.10"
                  />
                  {errors.homeOdds && <span className="field-error-text">{errors.homeOdds}</span>}
                </div>
              </div>
            )}

            {marketType === '3WAY' && drawInput && (
              <div className="odds-card">
                <div className="odds-card-header">
                  <span className="outcome-badge badge-draw">Draw (X)</span>
                  <input
                    type="text"
                    className="name-edit-input"
                    value={drawInput.label}
                    onChange={(e) => onTeamNameChange('DRAW', e.target.value)}
                    placeholder="Draw"
                  />
                </div>
                <div className="odds-card-body">
                  <label className="field-label-sm">Decimal Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    className={`odds-number-input ${errors.drawOdds ? 'input-error' : ''}`}
                    value={drawInput.odds}
                    onChange={(e) =>
                      onOddsChange('DRAW', e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="3.80"
                  />
                  {errors.drawOdds && <span className="field-error-text">{errors.drawOdds}</span>}
                </div>
              </div>
            )}

            {awayInput && (
              <div className="odds-card">
                <div className="odds-card-header">
                  <span className="outcome-badge badge-away">Team B (Away)</span>
                  <input
                    type="text"
                    className="name-edit-input"
                    value={awayInput.label}
                    onChange={(e) => onTeamNameChange('AWAY', e.target.value)}
                    placeholder="Team B Name"
                  />
                </div>
                <div className="odds-card-body">
                  <label className="field-label-sm">Decimal Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    className={`odds-number-input ${errors.awayOdds ? 'input-error' : ''}`}
                    value={awayInput.odds}
                    onChange={(e) =>
                      onOddsChange('AWAY', e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="2.05"
                  />
                  {errors.awayOdds && <span className="field-error-text">{errors.awayOdds}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions-row">
          <button type="button" className="btn btn-primary" onClick={onCalculate}>
            <Calculator size={16} />
            <span>Calculate Arbitrage & Allocation</span>
          </button>

          <button type="button" className="btn btn-outline" onClick={onReset}>
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>
    </section>
  );
};
