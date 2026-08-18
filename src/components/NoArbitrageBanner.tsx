import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import type { ArbitrageResult } from '../types/arbitrage';
import { formatPct } from '../utils/calculatorEngine';

interface NoArbitrageBannerProps {
  result: ArbitrageResult | null;
}

export const NoArbitrageBanner: React.FC<NoArbitrageBannerProps> = ({ result }) => {
  if (!result || result.isTrueArbitrage) {
    return null;
  }

  return (
    <div className="no-arb-container">
      <div className="no-arb-banner">
        <div className="no-arb-icon-wrapper">
          <AlertTriangle size={24} className="text-amber" />
        </div>
        <div className="no-arb-content">
          <div className="no-arb-header">
            <h3 className="no-arb-title">NO ARBITRAGE OPPORTUNITY DETECTED</h3>
            <span className="no-arb-badge font-mono">
              Combined Implied Probability: {formatPct(result.sumProbabilityPct)}
            </span>
          </div>

          <p className="no-arb-message">
            The combined implied probability for these odds is <strong>{formatPct(result.sumProbabilityPct)}</strong> (&ge; 100.00%). Because the bookmaker overround margin is {formatPct(result.sumProbabilityPct - 100)}, these odds do not form a mathematical arbitrage opportunity.
          </p>

          <div className="no-arb-bullets">
            <div className="bullet-item">
              <Info size={14} className="text-subtle flex-shrink-0" />
              <span>No guaranteed profit allocation can be constructed for this market setup.</span>
            </div>
            <div className="bullet-item">
              <Info size={14} className="text-subtle flex-shrink-0" />
              <span>To find an arbitrage opportunity, look for matches where the sum of reciprocal odds is less than 1.00 (100%).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
