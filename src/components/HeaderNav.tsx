import React from 'react';
import { ShieldCheck, BarChart3 } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  return (
    <header className="brand-header">
      <div className="header-inner">
        <div className="brand-title-group">
          <div className="brand-logo-icon">
            <BarChart3 size={22} className="logo-icon" />
          </div>
          <div>
            <div className="brand-name-row">
              <h1 className="brand-name">MatchEdge</h1>
              <span className="brand-badge">Quantitative Analytics</span>
            </div>
            <p className="brand-subtitle">1X2 Arbitrage & Stake Allocation Analyzer</p>
          </div>
        </div>

        <div className="header-meta">
          <div className="security-tag">
            <ShieldCheck size={16} className="text-blue" />
            <span>Pure Calculation & Simulation Tool</span>
          </div>
        </div>
      </div>
    </header>
  );
};
