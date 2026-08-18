import { useState, useMemo, useRef } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { MetricsOverview } from './components/MetricsOverview';
import { MatchInputSection } from './components/MatchInputSection';
import { StakeDistributionTable } from './components/StakeDistributionTable';
import { PerTeamIdSummary } from './components/PerTeamIdSummary';
import { IdBreakdownPanel } from './components/IdBreakdownPanel';
import { VerificationPanel } from './components/VerificationPanel';
import { NoArbitrageBanner } from './components/NoArbitrageBanner';
import { FormulaExplanation } from './components/FormulaExplanation';

import type { MarketType, AllocationMode, OutcomeInput, ValidationErrors } from './types/arbitrage';
import { calculateArbitrage, validateCalculatorInputs } from './utils/calculatorEngine';

import './App.css';

const DEFAULT_TOTAL_AMOUNT = 10000;
const DEFAULT_MAX_STAKE = 100;

const DEFAULT_OUTCOMES: OutcomeInput[] = [
  { id: 'HOME', label: 'Team A', odds: 2.25 },
  { id: 'DRAW', label: 'Draw', odds: 3.85 },
  { id: 'AWAY', label: 'Team B', odds: 3.85 },
];

export function App() {
  const [marketType, setMarketType] = useState<MarketType>('3WAY');
  const [allocationMode, setAllocationMode] = useState<AllocationMode>('EXACT');
  const [totalAmount, setTotalAmount] = useState<number | ''>(DEFAULT_TOTAL_AMOUNT);
  const [maxStakePerId, setMaxStakePerId] = useState<number | ''>(DEFAULT_MAX_STAKE);
  const [outcomesInput, setOutcomesInput] = useState<OutcomeInput[]>(DEFAULT_OUTCOMES);

  const resultsRef = useRef<HTMLDivElement>(null);

  const errors: ValidationErrors = useMemo(() => {
    const homeOdds = outcomesInput.find((o) => o.id === 'HOME')?.odds ?? '';
    const drawOdds = outcomesInput.find((o) => o.id === 'DRAW')?.odds ?? '';
    const awayOdds = outcomesInput.find((o) => o.id === 'AWAY')?.odds ?? '';

    return validateCalculatorInputs(
      marketType,
      totalAmount,
      maxStakePerId,
      homeOdds,
      drawOdds,
      awayOdds
    );
  }, [marketType, totalAmount, maxStakePerId, outcomesInput]);

  const result = useMemo(() => {
    if (Object.keys(errors).length > 0 || totalAmount === '' || maxStakePerId === '') {
      return null;
    }

    return calculateArbitrage(
      marketType,
      allocationMode,
      Number(totalAmount),
      Number(maxStakePerId),
      outcomesInput
    );
  }, [marketType, allocationMode, totalAmount, maxStakePerId, outcomesInput, errors]);

  const handleMarketTypeChange = (newMarket: MarketType) => {
    setMarketType(newMarket);
  };

  const handleOddsChange = (id: 'HOME' | 'DRAW' | 'AWAY', oddsVal: number | '') => {
    setOutcomesInput((prev) =>
      prev.map((o) => (o.id === id ? { ...o, odds: oddsVal } : o))
    );
  };

  const handleTeamNameChange = (id: 'HOME' | 'DRAW' | 'AWAY', name: string) => {
    setOutcomesInput((prev) =>
      prev.map((o) => (o.id === id ? { ...o, label: name } : o))
    );
  };

  const handleReset = () => {
    setMarketType('3WAY');
    setAllocationMode('EXACT');
    setTotalAmount(DEFAULT_TOTAL_AMOUNT);
    setMaxStakePerId(DEFAULT_MAX_STAKE);
    setOutcomesInput(DEFAULT_OUTCOMES);
  };

  const handleCalculate = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-layout">
      <HeaderNav />

      <main className="main-container">
        <MetricsOverview result={result} />

        <MatchInputSection
          marketType={marketType}
          allocationMode={allocationMode}
          totalAmount={totalAmount}
          maxStakePerId={maxStakePerId}
          outcomesInput={outcomesInput}
          errors={errors}
          onMarketTypeChange={handleMarketTypeChange}
          onAllocationModeChange={setAllocationMode}
          onTotalAmountChange={setTotalAmount}
          onMaxStakeChange={setMaxStakePerId}
          onOddsChange={handleOddsChange}
          onTeamNameChange={handleTeamNameChange}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />

        <div ref={resultsRef} id="results-section">
          {result && !result.isTrueArbitrage && <NoArbitrageBanner result={result} />}

          {result && (
            <div className="results-wrapper">
              <StakeDistributionTable result={result} />
              <PerTeamIdSummary result={result} />
              <IdBreakdownPanel result={result} />
              <VerificationPanel result={result} />
            </div>
          )}
        </div>

        <FormulaExplanation />
      </main>

      <footer className="brand-footer">
        <div className="footer-inner">
          <p>MatchEdge • 1X2 Arbitrage & Allocation Analyzer • Financial Risk Analysis & Calculation Simulator</p>
        </div>
      </footer>
    </div>
  );
}
