import React from 'react';
import { Table, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { ArbitrageResult } from '../types/arbitrage';
import { formatCurrency, formatPct } from '../utils/calculatorEngine';

interface StakeDistributionTableProps {
  result: ArbitrageResult | null;
}

export const StakeDistributionTable: React.FC<StakeDistributionTableProps> = ({ result }) => {
  if (!result || !result.outcomes || result.outcomes.length === 0) {
    return null;
  }

  const isExactMode = result.allocationMode === 'EXACT';

  return (
    <section className="card-panel">
      <div className="card-panel-header">
        <div className="panel-title-group">
          <Table size={18} className="text-blue" />
          <h2 className="panel-heading">Stake Allocation & Outcome Distribution</h2>
        </div>
        <div className="header-meta-badge">
          <span className="badge-mode">
            {result.idCalculationBasis === 'PAYOUT' ? `Basis: Max Payout $${result.maxPayoutPerId}/ID` : `Basis: Max Stake $${result.maxStakePerId}/ID`} • {isExactMode ? 'Exact Mode' : 'Full Units Mode'}
          </span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="th-left">Outcome Selection</th>
              <th className="th-right">Decimal Odds</th>
              <th className="th-right">Implied %</th>
              <th className="th-right">Ideal Stake</th>
              <th className="th-right">IDs Needed</th>
              <th className="th-right">{result.idCalculationBasis === 'PAYOUT' ? `$${result.maxPayoutPerId} Payout Units` : `$${result.maxStakePerId} Units`}</th>
              <th className="th-right">Remaining ID</th>
              <th className="th-right">Gross Payout</th>
              <th className="th-right">Net Profit</th>
              <th className="th-right">ROI (%)</th>
            </tr>
          </thead>
          <tbody>
            {result.outcomes.map((o) => {
              const isProfit = o.profit >= 0;
              const isDraw = o.id === 'DRAW';
              const isSingleDraw = isDraw && !result.splitDrawIds;

              return (
                <tr key={o.id}>
                  <td className="td-left">
                    <div className="outcome-name-cell">
                      <span className={`outcome-badge badge-${o.id.toLowerCase()}`}>{o.id}</span>
                      <span className="outcome-team-name">{o.label}</span>
                    </div>
                  </td>
                  <td className="td-right num-tabular bold-val">{o.odds.toFixed(2)}</td>
                  <td className="td-right num-tabular">{formatPct(o.impliedProbPct)}</td>
                  <td className="td-right num-tabular font-medium">
                    {formatCurrency(o.theoreticalStake)}
                  </td>
                  <td className="td-right num-tabular">
                    <span className={`id-pill ${isSingleDraw ? 'id-pill-draw' : ''}`}>
                      {isSingleDraw ? '1 ID (Single ID)' : `${o.requiredIdsCount} IDs`}
                    </span>
                  </td>
                  <td className="td-right num-tabular cell-nowrap">
                    {isSingleDraw ? (
                      `1 × ${formatCurrency(o.actualStake)}`
                    ) : o.fullIdsCount > 0 ? (
                      `${o.fullIdsCount} × ${formatCurrency(o.stakePerFullId)}`
                    ) : (
                      '0 Units'
                    )}
                  </td>
                  <td className="td-right num-tabular text-subtle cell-nowrap">
                    {isSingleDraw ? (
                      '—'
                    ) : o.isLastIdPartial ? (
                      `${formatCurrency(o.lastIdAmount)} (${formatCurrency(o.lastIdPayout)})`
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="td-right num-tabular font-medium text-blue">
                    {formatCurrency(o.payout)}
                  </td>
                  <td className={`td-right num-tabular bold-val ${isProfit ? 'text-green' : 'text-danger'}`}>
                    <div className="profit-cell-inline">
                      {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>{isProfit ? '+' : ''}{formatCurrency(o.profit)}</span>
                    </div>
                  </td>
                  <td className="td-right num-tabular">
                    <span className={`roi-tag ${isProfit ? 'roi-tag-green' : 'roi-tag-red'}`}>
                      {isProfit ? '+' : ''}{formatPct(o.roiPct)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot-row">
              <td className="td-left bold-val">TOTAL INVESTMENT</td>
              <td className="td-right">—</td>
              <td className="td-right num-tabular bold-val">
                {formatPct(result.sumProbabilityPct)}
              </td>
              <td className="td-right num-tabular bold-val text-blue">
                {formatCurrency(result.actualTotalInvestment)}
              </td>
              <td className="td-right num-tabular bold-val cell-nowrap">{result.totalIdsRequired} IDs</td>
              <td className="td-right num-tabular cell-nowrap">{result.totalFullUnits} Full Units</td>
              <td className="td-right num-tabular">{result.totalPartialUnits} Remainder</td>
              <td className="td-right num-tabular bold-val text-blue">
                {formatCurrency(result.expectedPayoutAvg)} (Avg)
              </td>
              <td className={`td-right num-tabular bold-val ${result.expectedProfitMin >= 0 ? 'text-green' : 'text-danger'}`}>
                {result.expectedProfitMin >= 0 ? '+' : ''}{formatCurrency(result.expectedProfitMin)}
              </td>
              <td className="td-right num-tabular bold-val">
                {formatPct(result.expectedRoiMinPct)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isExactMode && (
        <div className="table-notice-banner notice-blue">
          <Info size={16} className="text-blue flex-shrink-0" />
          <span>
            <strong>FULL UNITS MODE ACTIVE:</strong> Ideal stakes rounded UP to nearest full {result.idCalculationBasis === 'PAYOUT' ? `$${result.maxPayoutPerId} Payout` : `$${result.maxStakePerId} Stake`} unit. {result.splitDrawIds ? 'Draw is divided across IDs.' : 'Draw is invested in 1 single ID.'} Total investment increased by <strong>+{formatCurrency(result.additionalInvestmentTotal)}</strong>.
          </span>
        </div>
      )}

      {result.reconciliationAdjustment !== 0 && isExactMode && (
        <div className="table-notice-banner notice-gray">
          <Info size={16} className="text-muted flex-shrink-0" />
          <span>
            Floating-point precision rounding reconciled: {result.reconciliationAdjustment > 0 ? '+' : ''}${result.reconciliationAdjustment.toFixed(2)} automatically adjusted to maintain exact target investment.
          </span>
        </div>
      )}
    </section>
  );
};
