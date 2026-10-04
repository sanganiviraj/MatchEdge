import React from 'react';
import { Users, ShieldAlert } from 'lucide-react';
import type { ArbitrageResult } from '../types/arbitrage';
import { formatCurrency } from '../utils/calculatorEngine';

interface IdBreakdownPanelProps {
  result: ArbitrageResult | null;
}

export const IdBreakdownPanel: React.FC<IdBreakdownPanelProps> = ({ result }) => {
  if (!result) return null;

  return (
    <section className="card-panel">
      <div className="card-panel-header">
        <div className="panel-title-group">
          <Users size={18} className="text-blue" />
          <h2 className="panel-heading">ID Allocation Capacity & Unit Breakdown</h2>
        </div>
        <div className="header-meta-badge">
          <span className="badge-meta">
            {result.idCalculationBasis === 'PAYOUT'
              ? `Max $${result.maxPayoutPerId} Payout / ID`
              : `Max $${result.maxStakePerId} Stake / ID`}
          </span>
        </div>
      </div>

      <div className="id-grid-container">
        <div className="id-metrics-grid">
          <div className="id-stat-box">
            <span className="stat-box-lbl">Total IDs Required</span>
            <div className="stat-box-val num-tabular text-dark">{result.totalIdsRequired}</div>
            <span className="stat-box-sub">
              {result.marketType === '3WAY'
                ? result.splitDrawIds
                  ? 'All 3 outcomes split'
                  : 'Teams + 1 Draw ID'
                : 'Across all outcomes'}
            </span>
          </div>

          <div className="id-stat-box">
            <span className="stat-box-lbl">Max Single Outcome IDs</span>
            <div className="stat-box-val num-tabular text-blue">{result.maxIdsSingleOutcome}</div>
            <span className="stat-box-sub">Peak single market load</span>
          </div>

          <div className="id-stat-box">
            <span className="stat-box-lbl">
              {result.idCalculationBasis === 'PAYOUT'
                ? `Full $${result.maxPayoutPerId} Payout Units`
                : `Full $${result.maxStakePerId} Stake Units`}
            </span>
            <div className="stat-box-val num-tabular text-green">{result.totalFullUnits}</div>
            <span className="stat-box-sub">Full capacity accounts</span>
          </div>

          <div className="id-stat-box">
            <span className="stat-box-lbl">Partial / Single ID Units</span>
            <div className="stat-box-val num-tabular text-amber">
              {result.totalPartialUnits + (!result.splitDrawIds && result.marketType === '3WAY' ? 1 : 0)}
            </div>
            <span className="stat-box-sub">Remainder & single accounts</span>
          </div>
        </div>

        <div className="id-list-section">
          <h3 className="sub-heading">Per-Outcome Stake & ID Breakdown</h3>
          <div className="id-cards-list">
            {result.outcomes.map((o) => {
              const isDraw = o.id === 'DRAW';
              const isSingleDraw = isDraw && !result.splitDrawIds;

              return (
                <div key={o.id} className="id-breakdown-card">
                  <div className="id-card-top">
                    <span className={`outcome-badge badge-${o.id.toLowerCase()}`}>{o.id}</span>
                    <span className="id-card-title">{o.label}</span>
                    <span className="id-card-total-stake num-tabular">{formatCurrency(o.actualStake)}</span>
                  </div>

                  <div className="id-card-detail-row">
                    <div className="detail-item">
                      <span className="d-lbl">Allocated IDs:</span>
                      <span className="d-val num-tabular bold-val">
                        {isSingleDraw ? '1 ID (Single Account)' : `${o.requiredIdsCount} IDs`}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="d-lbl">Structure:</span>
                      <span className="d-val num-tabular">
                        {isSingleDraw
                          ? `1 × ${formatCurrency(o.actualStake)} (Payout: ${formatCurrency(o.payout)})`
                          : o.fullIdsCount > 0
                          ? `${o.fullIdsCount} × ${formatCurrency(o.stakePerFullId)} (${formatCurrency(o.payoutPerFullId)} Payout / ID)`
                          : '0 Full Units'}
                      </span>
                    </div>

                    {!isSingleDraw && o.isLastIdPartial && (
                      <div className="detail-item">
                        <span className="d-lbl">Partial Unit (Last ID):</span>
                        <span className="d-val num-tabular text-amber">
                          1 × {formatCurrency(o.lastIdAmount)} ({formatCurrency(o.lastIdPayout)} Payout)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel-footer-disclaimer">
        <ShieldAlert size={16} className="text-amber flex-shrink-0" />
        <span>
          <strong>ID ALLOCATION POLICY:</strong>{' '}
          {result.idCalculationBasis === 'PAYOUT'
            ? `Each betting ID is calculated and capped at a maximum payout of $${result.maxPayoutPerId}.`
            : result.idCalculationBasis === 'DUAL'
            ? `Each betting ID enforces both a maximum stake of $${result.maxStakePerId} and maximum payout of $${result.maxPayoutPerId}.`
            : `Each betting ID is capped at a maximum stake of $${result.maxStakePerId}.`}{' '}
          {result.marketType === '3WAY' &&
            (!result.splitDrawIds
              ? 'Draw money is placed entirely on 1 single account.'
              : 'Draw stakes are divided across IDs proportionally.')}
        </span>
      </div>
    </section>
  );
};
