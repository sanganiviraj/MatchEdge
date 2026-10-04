import React from 'react';
import { Users, Layers } from 'lucide-react';
import type { ArbitrageResult } from '../types/arbitrage';
import { formatCurrency, formatPct } from '../utils/calculatorEngine';

interface PerTeamIdSummaryProps {
  result: ArbitrageResult | null;
}

export const PerTeamIdSummary: React.FC<PerTeamIdSummaryProps> = ({ result }) => {
  if (!result || !result.outcomes || result.outcomes.length === 0) {
    return null;
  }

  return (
    <section className="card-panel per-team-summary-panel">
      <div className="card-panel-header">
        <div className="panel-title-group">
          <Users size={18} className="text-blue" />
          <h2 className="panel-heading">Per-Outcome Required IDs & Investment Summary</h2>
        </div>
        <div className="header-meta-badge">
          <span className="badge-mode">
            {result.idCalculationBasis === 'PAYOUT'
              ? `Max Payout / ID: $${result.maxPayoutPerId}`
              : `Max Stake / ID: $${result.maxStakePerId}`}
          </span>
        </div>
      </div>

      <div className="per-team-cards-grid">
        {result.outcomes.map((o) => {
          const isProfit = o.profit >= 0;
          const isDraw = o.id === 'DRAW';
          const isSingleDraw = isDraw && !result.splitDrawIds;

          return (
            <div key={o.id} className="team-id-card">
              <div className="team-id-card-header">
                <div className="team-badge-row">
                  <span className={`outcome-badge badge-${o.id.toLowerCase()}`}>
                    {o.id === 'HOME' ? 'Team 1 (Home)' : o.id === 'AWAY' ? 'Team 2 (Away)' : 'Draw (X)'}
                  </span>
                  <span className="team-card-label">{o.label}</span>
                </div>
                <span className="team-card-odds font-mono">@ {o.odds.toFixed(2)}</span>
              </div>

              <div className="team-id-hero">
                <div className="hero-stat">
                  <span className="hero-lbl">Required Stake</span>
                  <span className="hero-val text-blue num-tabular">{formatCurrency(o.actualStake)}</span>
                </div>
                <div className="hero-divider">→</div>
                <div className="hero-stat">
                  <span className="hero-lbl">Total IDs Required</span>
                  <span className="hero-val text-dark num-tabular">
                    {isSingleDraw ? '1 ID' : `${o.requiredIdsCount} IDs`}
                  </span>
                </div>
              </div>

              <div className="last-id-callout">
                <div className="last-id-row">
                  <span className="last-id-title">
                    <Layers size={14} className="text-blue" />
                    <span>ID Distribution Breakdown:</span>
                  </span>
                </div>

                <div className="last-id-details-box">
                  {isSingleDraw ? (
                    <div className="dist-chip chip-last-partial">
                      <span>
                        Single Account (<strong>ID #1</strong>): invested full Draw money{' '}
                        <strong className="text-blue">{formatCurrency(o.actualStake)}</strong> (Payout: {formatCurrency(o.payout)})
                      </span>
                    </div>
                  ) : (
                    <>
                      {o.fullIdsCount > 0 && (
                        <div className="dist-chip chip-full">
                          <strong>{o.fullIdsCount} IDs</strong> × {formatCurrency(o.stakePerFullId)} ({formatCurrency(o.payoutPerFullId)} Payout / ID)
                        </div>
                      )}

                      {o.isLastIdPartial ? (
                        <div className="dist-chip chip-last-partial">
                          <span>
                            Last ID (<strong>ID #{o.lastIdNumber}</strong>): invested{' '}
                            <strong className="text-blue">{formatCurrency(o.lastIdAmount)}</strong> ({formatCurrency(o.lastIdPayout)} Payout)
                          </span>
                        </div>
                      ) : o.fullIdsCount === 0 && (
                        <div className="dist-chip chip-full">
                          <span>
                            ID #1: invested{' '}
                            <strong className="text-blue">{formatCurrency(o.lastIdAmount)}</strong> ({formatCurrency(o.lastIdPayout)} Payout)
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="team-outcome-footer">
                <div className="outcome-row">
                  <span className="o-lbl">Outcome if {o.label} Wins:</span>
                </div>
                <div className="outcome-metrics">
                  <div className="o-metric">
                    <span className="o-sub-lbl">Gross Payout</span>
                    <span className="o-sub-val num-tabular font-medium">{formatCurrency(o.payout)}</span>
                  </div>
                  <div className="o-metric">
                    <span className="o-sub-lbl">Net Profit</span>
                    <span className={`o-sub-val num-tabular bold-val ${isProfit ? 'text-green' : 'text-danger'}`}>
                      {isProfit ? '+' : ''}{formatCurrency(o.profit)}
                    </span>
                  </div>
                  <div className="o-metric">
                    <span className="o-sub-lbl">ROI Rate</span>
                    <span className={`roi-tag ${isProfit ? 'roi-tag-green' : 'roi-tag-red'}`}>
                      {isProfit ? '+' : ''}{formatPct(o.roiPct)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
