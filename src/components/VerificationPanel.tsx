import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import type { ArbitrageResult } from '../types/arbitrage';
import { formatCurrency, formatPct } from '../utils/calculatorEngine';

interface VerificationPanelProps {
  result: ArbitrageResult | null;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ result }) => {
  if (!result) return null;

  return (
    <section className="card-panel">
      <div className="card-panel-header">
        <div className="panel-title-group">
          <ShieldCheck size={18} className="text-blue" />
          <h2 className="panel-heading">Final Cross-Check & Reverse Verification</h2>
        </div>
        <div className="header-meta-badge">
          {result.isPayoutBalanced ? (
            <span className="status-pill status-yes">
              <CheckCircle2 size={14} /> Payouts Balanced
            </span>
          ) : (
            <span className="status-pill status-warning">
              <AlertTriangle size={14} /> Payout Variance
            </span>
          )}
        </div>
      </div>

      <div className="verification-grid">
        <div className="verif-card">
          <h3 className="verif-card-title">Investment & Settlement Reconciliation</h3>

          <div className="verif-rows-list">
            <div className="verif-row">
              <span className="v-lbl">Theoretical Investment Target</span>
              <span className="v-val num-tabular font-medium">
                {formatCurrency(result.totalTargetInvestment)}
              </span>
            </div>

            <div className="verif-row">
              <span className="v-lbl">Actual Allocated Investment</span>
              <span className="v-val num-tabular bold-val text-blue">
                {formatCurrency(result.actualTotalInvestment)}
              </span>
            </div>

            {result.outcomes.map((o) => (
              <div key={o.id} className="verif-row">
                <span className="v-lbl">Expected Payout — {o.label}</span>
                <span className="v-val num-tabular font-medium">{formatCurrency(o.payout)}</span>
              </div>
            ))}

            <div className="verif-row divider-top">
              <span className="v-lbl">Payout Variance (Max Diff)</span>
              <span className={`v-val num-tabular ${result.isPayoutBalanced ? 'text-green' : 'text-amber'}`}>
                {formatCurrency(result.payoutDifference)}
              </span>
            </div>

            <div className="verif-row highlighted-row">
              <span className="v-lbl bold-val">Guaranteed Profit</span>
              <span className={`v-val num-tabular bold-val ${result.isGuaranteedProfit ? 'text-green' : 'text-danger'}`}>
                {result.isGuaranteedProfit ? `+${formatCurrency(result.expectedProfitMin)}` : 'No Guarantee'}
              </span>
            </div>

            <div className="verif-row">
              <span className="v-lbl">Guaranteed Net ROI</span>
              <span className={`v-val num-tabular ${result.isGuaranteedProfit ? 'text-green' : 'text-danger'}`}>
                {result.isGuaranteedProfit ? `+${formatPct(result.expectedRoiMinPct)}` : '0.00%'}
              </span>
            </div>
          </div>
        </div>

        <div className="verif-card">
          <div className="reverse-check-header">
            <Scale size={18} className="text-blue" />
            <h3 className="verif-card-title">Reverse Check Validation</h3>
          </div>

          <p className="verif-desc">
            Independently verifies that <code className="code-inline">Stake × Decimal Odds = Gross Payout</code> across all outcome branches.
          </p>

          <div className="reverse-status-box">
            {result.isPayoutBalanced ? (
              <div className="rev-badge rev-badge-success">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <div>
                  <span className="rev-title">✓ PAYOUTS PERFECTLY BALANCED</span>
                  <span className="rev-sub">Equal return achieved across all possible match outcomes.</span>
                </div>
              </div>
            ) : (
              <div className="rev-badge rev-badge-warning">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <div>
                  <span className="rev-title">⚠ PAYOUT MISMATCH DETECTED</span>
                  <span className="rev-sub">Rounding or unit allocation creates payout variance across outcomes.</span>
                </div>
              </div>
            )}
          </div>

          <div className="reverse-metrics-grid">
            <div className="rev-stat-item">
              <span className="r-lbl">Minimum Payout</span>
              <span className="r-val num-tabular font-medium">{formatCurrency(result.expectedPayoutMin)}</span>
            </div>

            <div className="rev-stat-item">
              <span className="r-lbl">Maximum Payout</span>
              <span className="r-val num-tabular font-medium">{formatCurrency(result.expectedPayoutMax)}</span>
            </div>

            <div className="rev-stat-item">
              <span className="r-lbl">Average Payout</span>
              <span className="r-val num-tabular font-medium">{formatCurrency(result.expectedPayoutAvg)}</span>
            </div>

            <div className="rev-stat-item">
              <span className="r-lbl">Max Payout Spread</span>
              <span className={`r-val num-tabular ${result.isPayoutBalanced ? 'text-green' : 'text-amber'}`}>
                {formatCurrency(result.payoutDifference)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
