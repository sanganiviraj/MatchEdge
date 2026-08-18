export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export type PromoPayoutType = 'CASH' | 'BONUS_CREDIT';

export type AllocationStrategy = 'EQUAL_RETURN' | 'LOW_RISK' | 'BALANCED' | 'PROMO_OPTIMIZED';

export type SelectionType = 'HOME' | 'DRAW' | 'AWAY';

export type MatchRound = 'Round 1' | 'Round 2' | 'Other (Check Promo)';

export interface MatchDetails {
  id: string;
  name: string;
  round: MatchRound;
  kickoffTime: string;
  homeTeam: string;
  awayTeam: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  commissionPct: number; // e.g. 0% or 2% exchange fee
}

export interface UserAccount {
  id: string;
  alias: string;
  availableBalance: number;
  maxQualifyingStake: number; // Capped at promo limit ($100 default)
  assignedSelection?: SelectionType | 'UNASSIGNED';
  allocatedStake?: number;
  notes?: string;
}

export interface PromoConfig {
  totalBankroll: number;
  currency: CurrencyCode;
  maxQualifyingStakePerBet: number; // Standard $100 USD
  payoutType: PromoPayoutType;
  bonusRetentionPct: number; // e.g. 80% if paid as free bet credit
  promoEligibleTeam: 'HOME_ONLY' | 'AWAY_ONLY' | 'BOTH' | 'NONE';
  strategy: AllocationStrategy;
  requireRound1Or2Check: boolean;
  preMatchOnly: boolean;
}

export interface ImpliedProbability {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  totalImpliedProb: number; // Overround margin
  arbitragePct: number; // Profit margin: (1 - totalImpliedProb) * 100
  isTrueArbitrage: boolean;
}

export interface OutcomeResult {
  selection: SelectionType;
  teamName: string;
  odds: number;
  stake: number;
  grossReturn: number;
  netPL: number;
  roiPct: number;
}

export interface ScenarioOutcome {
  id: string;
  firstScorer: 'HOME' | 'AWAY' | 'NONE';
  finalResult: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
  title: string;
  description: string;
  homeBetResult: 'WIN' | 'PROMO_PAYOUT' | 'LOSS';
  drawBetResult: 'WIN' | 'LOSS';
  awayBetResult: 'WIN' | 'PROMO_PAYOUT' | 'LOSS';
  totalStake: number;
  totalGrossReturn: number;
  netPL: number;
  roiPct: number;
  isPromoTriggered: boolean;
  promoDetails: string;
}

export interface MultiIdRow {
  accountId: string;
  accountAlias: string;
  matchName: string;
  selection: SelectionType;
  selectionLabel: string;
  stake: number;
  odds: number;
  grossReturn: number;
  normalPL: number;
  promoTriggeredPL: number;
  warnings: string[];
}

export interface CashoutSimulation {
  liveTimeMinutes: number;
  currentScore: string;
  firstScorer: 'HOME' | 'AWAY' | 'NONE';
  homeCashoutOffer: number;
  drawCashoutOffer: number;
  awayCashoutOffer: number;
  totalCashoutReturn: number;
  cashoutNetPL: number;
  holdBestPL: number;
  holdWorstPL: number;
  recommendation: string;
  promoWarning: string;
}

export interface PresetMatch {
  id: string;
  name: string;
  match: MatchDetails;
  accounts: UserAccount[];
  config: Partial<PromoConfig>;
  description: string;
}
