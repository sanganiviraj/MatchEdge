import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle } from 'lucide-react';

export const FormulaExplanation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="card-panel explanation-card">
      <button
        type="button"
        className="explanation-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="toggle-left">
          <BookOpen size={18} className="text-blue" />
          <span className="toggle-title">How is 1X2 Sports Arbitrage Calculated?</span>
        </div>
        <div className="toggle-right">
          <span className="toggle-hint">{isOpen ? 'Hide Formula Guide' : 'Show Formula Guide'}</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isOpen && (
        <div className="explanation-body">
          <div className="expl-grid">
            <div className="expl-box">
              <h4 className="expl-heading">1. Implied Probability</h4>
              <p className="expl-text">
                Every decimal odds value represents an implied probability of that outcome occurring:
              </p>
              <div className="formula-box">
                <code>Implied Probability = 1 ÷ Decimal Odds</code>
              </div>
            </div>

            <div className="expl-box">
              <h4 className="expl-heading">2. Combined Probability (Overround)</h4>
              <p className="expl-text">
                Sum the implied probabilities across all possible outcome selections:
              </p>
              <div className="formula-box">
                <code>Sum Probability = P(Team A) + P(Draw) + P(Team B)</code>
              </div>
            </div>

            <div className="expl-box">
              <h4 className="expl-heading">3. Arbitrage Condition</h4>
              <p className="expl-text">
                A mathematical arbitrage opportunity exists <strong>ONLY</strong> when:
              </p>
              <div className="formula-box">
                <code>Sum Probability &lt; 1.00 (100%)</code>
              </div>
            </div>

            <div className="expl-box">
              <h4 className="expl-heading">4. Optimal Stake Allocation</h4>
              <p className="expl-text">
                To guarantee equal gross return across every outcome, distribute total investment $T$:
              </p>
              <div className="formula-box">
                <code>Stake_i = T × (1 ÷ Odds_i) ÷ Sum Probability</code>
              </div>
            </div>
          </div>

          <div className="expl-disclaimer">
            <CheckCircle size={15} className="text-green flex-shrink-0" />
            <span>
              MatchEdge performs exact mathematical reconciliation to ensure sum of outcome stakes equals your total target investment without rounding leakage.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
