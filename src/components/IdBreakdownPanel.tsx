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
          <span className="badge-meta">Max ${result.maxStakePerId} / ID</span>
        </div>
      </div>

      <div className="id-grid-container">
        <div className="id-metrics-grid">
          <div className="id-stat-box">
            <span className="stat-box-lbl">Total IDs Required</span>
            <div className="stat-box-val num-tabular text-dark">{result.totalIdsRequired}</div>
            <span className="stat-box-sub">Team IDs + 1 Draw ID</span>
          </div>

          <div className="id-stat-box">
            <span className="stat-box-lbl">Max Single Outcome IDs</span>
            <div className="stat-box-val num-tabular text-blue">{result.maxIdsSingleOutcome}</div>
            <span className="stat-box-sub">Peak single market load</span>
          </div>

          <div className="id-stat-box">
            <span className="stat-box-lbl">Full ${result.maxStakePerId} Units</span>
            <div className="stat-box-val num-tabular text-green">{result.totalFullUnits}</div>
            <span className="stat-box-sub">Full capacity accounts</span>
          </div>

          <div className="id-stat-box">
            <span className="stat-box-lbl">Partial / Single ID Units</span>
            <div className="stat-box-val num-tabular text-amber">{result.totalPartialUnits + (result.marketType === '3WAY' ? 1 : 0)}</div>
            <span className="stat-box-sub">Remainder & Draw accounts</span>
          </div>
        </div>

        <div className="id-list-section">
          <h3 className="sub-heading">Per-Outcome Stake & ID Breakdown</h3>
          <div className="id-cards-list">
            {result.outcomes.map((o) => {
              const isDraw = o.id === 'DRAW';
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
                        {isDraw ? '1 ID (Single Account)' : `${o.requiredIdsCount} IDs`}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="d-lbl">Structure:</span>
                      <span className="d-val num-tabular">
                        {isDraw
                          ? `1 × ${formatCurrency(o.actualStake)} (Full Draw Money)`
                          : `${o.fullIdsCount} × $${result.maxStakePerId} (${formatCurrency(o.fullIdsCount * result.maxStakePerId)})`}
                      </span>
                    </div>

                    {!isDraw && o.remainingStake > 0 && (
                      <div className="detail-item">
                        <span className="d-lbl">Partial Unit (Last ID):</span>
                        <span className="d-val num-tabular text-amber">
                          1 × {formatCurrency(o.remainingStake)}
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
          <strong>DRAW ALLOCATION RULE:</strong> All Draw money is placed entirely on 1 single account/ID. Team 1 and Team 2 stakes are divided into ${result.maxStakePerId} per-ID units.
        </span>
      </div>
    </section>
  );
};
