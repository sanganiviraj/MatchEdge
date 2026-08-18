import React from 'react';
import { CheckCircle2, XCircle, PieChart } from 'lucide-react';
import type { ArbitrageResult } from '../types/arbitrage';
import { formatCurrency, formatPct } from '../utils/calculatorEngine';

interface MetricsOverviewProps {
  result: ArbitrageResult | null;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="metrics-summary-bar empty-metrics-bar">
        <div className="empty-metrics-msg">
          <PieChart size={18} className="text-muted" />
          <span>Enter valid odds and bankroll inputs below to generate live arbitrage metrics.</span>
        </div>
      </div>
    );
  }

  const isArb = result.isTrueArbitrage;

  return (
    <div className="metrics-summary-bar">
      <div className={`metric-cell ${isArb ? 'cell-arb-yes' : 'cell-arb-no'}`}>
        <span className="metric-label">Arbitrage Status</span>
        <div className="metric-value-row">
          {isArb ? (
            <span className="status-pill status-yes">
              <CheckCircle2 size={15} /> YES
            </span>
          ) : (
            <span className="status-pill status-no">
              <XCircle size={15} /> NO ARBITRAGE
            </span>
          )}
        </div>
        <span className="metric-sub">
          {isArb ? 'Mathematical opportunity' : 'Combined prob ≥ 100%'}
        </span>
      </div>

      <div className="metric-cell">
        <span className="metric-label">Combined Implied %</span>
        <div className={`metric-value num-tabular ${isArb ? 'text-green' : 'text-amber'}`}>
          {formatPct(result.sumProbabilityPct)}
        </div>
        <span className="metric-sub">Sum (1 / Odds)</span>
      </div>

      <div className="metric-cell">
        <span className="metric-label">Arbitrage Margin</span>
        <div className={`metric-value num-tabular ${isArb ? 'text-green' : 'text-danger'}`}>
          {isArb ? '+' : ''}{formatPct(result.arbitrageMarginPct)}
        </div>
        <span className="metric-sub">{isArb ? 'Positive Spread' : 'Negative Spread'}</span>
      </div>

      <div className="metric-cell">
        <span className="metric-label">Expected ROI</span>
        <div className={`metric-value num-tabular ${result.expectedRoiMinPct >= 0 ? 'text-green' : 'text-danger'}`}>
          {result.expectedRoiMinPct >= 0 ? '+' : ''}{formatPct(result.expectedRoiMinPct)}
        </div>
        <span className="metric-sub">Min Return Rate</span>
      </div>

      <div className="metric-cell">
        <span className="metric-label">Total Investment</span>
        <div className="metric-value num-tabular text-dark">
          {formatCurrency(result.actualTotalInvestment)}
        </div>
        <span className="metric-sub">
          {result.additionalInvestmentTotal > 0
            ? `+${formatCurrency(result.additionalInvestmentTotal)} (Rounded Units)`
            : 'Exact Target'}
        </span>
      </div>

      <div className="metric-cell">
        <span className="metric-label">Expected Payout</span>
        <div className="metric-value num-tabular text-blue">
          {formatCurrency(result.expectedPayoutMin)}
        </div>
        <span className="metric-sub">
          {result.payoutDifference > 0 ? `Diff: ${formatCurrency(result.payoutDifference)}` : 'Equal Payouts'}
        </span>
      </div>

      <div className="metric-cell">
        <span className="metric-label">Expected Profit</span>
        <div className={`metric-value num-tabular ${result.expectedProfitMin >= 0 ? 'text-green' : 'text-danger'}`}>
          {result.expectedProfitMin >= 0 ? '+' : ''}{formatCurrency(result.expectedProfitMin)}
        </div>
        <span className="metric-sub">{result.isGuaranteedProfit ? 'Guaranteed Profit' : 'Risk Present'}</span>
      </div>

      <div className="metric-cell">
        <span className="metric-label">IDs Required</span>
        <div className="metric-value num-tabular text-dark">
          {result.totalIdsRequired} <span className="unit-label">IDs</span>
        </div>
        <span className="metric-sub">Max single outcome: {result.maxIdsSingleOutcome} IDs</span>
      </div>
    </div>
  );
};
