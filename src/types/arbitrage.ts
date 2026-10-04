export type MarketType = '2WAY' | '3WAY';

export type AllocationMode = 'EXACT' | 'FULL_UNITS';

export type IdCalculationBasis = 'PAYOUT' | 'STAKE' | 'DUAL';

export interface OutcomeInput {
  id: 'HOME' | 'DRAW' | 'AWAY';
  label: string;
  odds: number | '';
}

export interface OutcomeResult {
  id: 'HOME' | 'DRAW' | 'AWAY';
  label: string;
  odds: number;
  impliedProb: number;
  impliedProbPct: number;
  
  theoreticalStake: number;
  fullIdsCount: number;
  remainingStake: number;
  requiredIdsCount: number;
  
  stakePerFullId: number;
  payoutPerFullId: number;
  lastIdNumber: number;
  lastIdAmount: number;
  lastIdPayout: number;
  remainingPayout: number;
  isLastIdPartial: boolean;
  
  actualStake: number;
  additionalAllocation: number;
  fullUnitsCount: number;
  hasPartialUnit: boolean;
  
  payout: number;
  profit: number;
  roiPct: number;
}

export interface ArbitrageResult {
  marketType: MarketType;
  allocationMode: AllocationMode;
  idCalculationBasis: IdCalculationBasis;
  totalTargetInvestment: number;
  maxPayoutPerId: number;
  maxStakePerId: number;
  splitDrawIds: boolean;
  
  sumProbability: number;
  sumProbabilityPct: number;
  isTrueArbitrage: boolean;
  arbitrageMarginPct: number;
  theoreticalRoiPct: number;
  
  outcomes: OutcomeResult[];
  
  actualTotalInvestment: number;
  additionalInvestmentTotal: number;
  
  expectedPayoutMin: number;
  expectedPayoutMax: number;
  expectedPayoutAvg: number;
  payoutDifference: number;
  
  expectedProfitMin: number;
  expectedProfitMax: number;
  expectedProfitAvg: number;
  
  expectedRoiMinPct: number;
  expectedRoiMaxPct: number;
  expectedRoiAvgPct: number;
  
  totalIdsRequired: number;
  maxIdsSingleOutcome: number;
  totalFullUnits: number;
  totalPartialUnits: number;
  
  isPayoutBalanced: boolean;
  isGuaranteedProfit: boolean;
  reconciliationAdjustment: number;
}

export interface ValidationErrors {
  totalAmount?: string;
  maxPayoutPerId?: string;
  maxStakePerId?: string;
  homeOdds?: string;
  drawOdds?: string;
  awayOdds?: string;
}

