import type {
  MarketType,
  AllocationMode,
  IdCalculationBasis,
  OutcomeInput,
  OutcomeResult,
  ArbitrageResult,
  ValidationErrors,
} from '../types/arbitrage';

export function formatCurrency(amount: number, showDecimals: boolean = true): string {
  if (isNaN(amount) || !isFinite(amount)) return '$0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}

export function formatINR(amount: number, showDecimals: boolean = true): string {
  return formatCurrency(amount, showDecimals);
}

export function formatPct(val: number, decimals: number = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0.00%';
  return `${val.toFixed(decimals)}%`;
}

export function validateCalculatorInputs(
  marketType: MarketType,
  totalAmount: number | '',
  maxPayoutPerId: number | '',
  maxStakePerId: number | '',
  idCalculationBasis: IdCalculationBasis,
  homeOdds: number | '',
  drawOdds: number | '',
  awayOdds: number | ''
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (totalAmount === '' || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
    errors.totalAmount = 'Total amount must be greater than $0';
  }

  if (idCalculationBasis === 'PAYOUT' || idCalculationBasis === 'DUAL') {
    if (maxPayoutPerId === '' || isNaN(Number(maxPayoutPerId)) || Number(maxPayoutPerId) <= 0) {
      errors.maxPayoutPerId = 'Maximum payout must be greater than $0';
    }
  }

  if (idCalculationBasis === 'STAKE' || idCalculationBasis === 'DUAL') {
    if (maxStakePerId === '' || isNaN(Number(maxStakePerId)) || Number(maxStakePerId) <= 0) {
      errors.maxStakePerId = 'Maximum stake must be greater than $0';
    }
  }

  if (homeOdds === '' || isNaN(Number(homeOdds)) || Number(homeOdds) <= 1.0) {
    errors.homeOdds = 'Odds must be greater than 1.00';
  }

  if (marketType === '3WAY') {
    if (drawOdds === '' || isNaN(Number(drawOdds)) || Number(drawOdds) <= 1.0) {
      errors.drawOdds = 'Odds must be greater than 1.00';
    }
  }

  if (awayOdds === '' || isNaN(Number(awayOdds)) || Number(awayOdds) <= 1.0) {
    errors.awayOdds = 'Odds must be greater than 1.00';
  }

  return errors;
}

export function calculateArbitrage(
  marketType: MarketType,
  allocationMode: AllocationMode,
  idCalculationBasis: IdCalculationBasis,
  totalTargetInvestment: number,
  maxPayoutPerId: number,
  maxStakePerId: number,
  outcomesInput: OutcomeInput[],
  splitDrawIds: boolean = true
): ArbitrageResult | null {
  const activeInputs = outcomesInput.filter(
    (o) => marketType === '3WAY' || o.id !== 'DRAW'
  );

  const validInputs = activeInputs.map((o) => ({
    id: o.id,
    label: o.label,
    odds: typeof o.odds === 'number' && o.odds > 1.0 ? o.odds : 0,
  }));

  if (validInputs.some((o) => o.odds <= 1.0) || totalTargetInvestment <= 0) {
    return null;
  }

  if (idCalculationBasis === 'PAYOUT' && maxPayoutPerId <= 0) {
    return null;
  }
  if (idCalculationBasis === 'STAKE' && maxStakePerId <= 0) {
    return null;
  }
  if (idCalculationBasis === 'DUAL' && (maxPayoutPerId <= 0 || maxStakePerId <= 0)) {
    return null;
  }

  const effectiveMaxPayout = maxPayoutPerId > 0 ? maxPayoutPerId : 1000;
  const effectiveMaxStake = maxStakePerId > 0 ? maxStakePerId : 100;

  const impliedProbs = validInputs.map((o) => 1 / o.odds);
  const sumProbability = impliedProbs.reduce((sum, p) => sum + p, 0);
  const sumProbabilityPct = sumProbability * 100;

  const isTrueArbitrage = sumProbability > 0 && sumProbability < 1.0;
  const arbitrageMarginPct = (1 - sumProbability) * 100;
  const theoreticalRoiPct = sumProbability > 0 ? ((1 / sumProbability) - 1) * 100 : 0;

  let rawStakes = validInputs.map((_o, idx) => {
    const rawStake = (totalTargetInvestment * impliedProbs[idx]) / sumProbability;
    return Number(rawStake.toFixed(2));
  });

  const sumRawStakes = rawStakes.reduce((a, b) => a + b, 0);
  const reconciliationAdjustment = Number((totalTargetInvestment - sumRawStakes).toFixed(2));
  
  if (Math.abs(reconciliationAdjustment) > 0 && rawStakes.length > 0) {
    rawStakes[rawStakes.length - 1] = Number((rawStakes[rawStakes.length - 1] + reconciliationAdjustment).toFixed(2));
  }

  let totalFullUnits = 0;
  let totalPartialUnits = 0;

  const outcomes: OutcomeResult[] = validInputs.map((o, idx) => {
    const theoreticalStake = rawStakes[idx];
    const targetPayout = Number((theoreticalStake * o.odds).toFixed(2));

    let capacityStake: number;
    let capacityPayout: number;

    if (idCalculationBasis === 'PAYOUT') {
      capacityPayout = effectiveMaxPayout;
      capacityStake = Number((effectiveMaxPayout / o.odds).toFixed(2));
    } else if (idCalculationBasis === 'STAKE') {
      capacityStake = effectiveMaxStake;
      capacityPayout = Number((effectiveMaxStake * o.odds).toFixed(2));
    } else {
      const stakeCapFromPayout = effectiveMaxPayout / o.odds;
      capacityStake = Number(Math.min(effectiveMaxStake, stakeCapFromPayout).toFixed(2));
      capacityPayout = Number((capacityStake * o.odds).toFixed(2));
    }

    if (capacityStake <= 0) capacityStake = 1;
    if (capacityPayout <= 0) capacityPayout = 1;

    let fullIdsCount = 0;
    let requiredIdsCount = 1;
    let remainingStake = 0;
    let remainingPayout = 0;
    let lastIdNumber = 1;
    let lastIdAmount = theoreticalStake;
    let lastIdPayout = targetPayout;
    let isLastIdPartial = false;
    let actualStake = theoreticalStake;
    let additionalAllocation = 0;
    let fullUnitsCount = 1;
    let hasPartialUnit = false;

    const isSingleDraw = o.id === 'DRAW' && !splitDrawIds;

    if (isSingleDraw) {
      requiredIdsCount = 1;
      fullIdsCount = 0;
      fullUnitsCount = 1;
      remainingStake = theoreticalStake;
      remainingPayout = targetPayout;
      lastIdNumber = 1;
      lastIdAmount = theoreticalStake;
      lastIdPayout = targetPayout;
      isLastIdPartial = false;
      hasPartialUnit = false;
      actualStake = theoreticalStake;
      additionalAllocation = 0;
    } else {
      if (allocationMode === 'EXACT') {
        if (idCalculationBasis === 'PAYOUT') {
          fullIdsCount = Math.floor(targetPayout / capacityPayout);
          remainingPayout = Number((targetPayout - fullIdsCount * capacityPayout).toFixed(2));

          if (remainingPayout < 0.01) {
            remainingPayout = 0;
            remainingStake = 0;
            requiredIdsCount = Math.max(1, fullIdsCount);
            lastIdNumber = requiredIdsCount;
            lastIdPayout = capacityPayout;
            lastIdAmount = capacityStake;
            isLastIdPartial = false;
          } else {
            requiredIdsCount = fullIdsCount + 1;
            remainingStake = Number((remainingPayout / o.odds).toFixed(2));
            lastIdNumber = requiredIdsCount;
            lastIdPayout = remainingPayout;
            lastIdAmount = remainingStake;
            isLastIdPartial = true;
          }
          actualStake = theoreticalStake;
          fullUnitsCount = fullIdsCount;
          hasPartialUnit = isLastIdPartial;
        } else {
          fullIdsCount = Math.floor(theoreticalStake / capacityStake);
          remainingStake = Number((theoreticalStake % capacityStake).toFixed(2));

          if (remainingStake < 0.01) {
            remainingStake = 0;
            remainingPayout = 0;
            requiredIdsCount = Math.max(1, fullIdsCount);
            lastIdNumber = requiredIdsCount;
            lastIdAmount = capacityStake;
            lastIdPayout = capacityPayout;
            isLastIdPartial = false;
          } else {
            requiredIdsCount = fullIdsCount + 1;
            remainingPayout = Number((remainingStake * o.odds).toFixed(2));
            lastIdNumber = requiredIdsCount;
            lastIdAmount = remainingStake;
            lastIdPayout = remainingPayout;
            isLastIdPartial = true;
          }
          actualStake = theoreticalStake;
          fullUnitsCount = fullIdsCount;
          hasPartialUnit = isLastIdPartial;
        }
      } else {
        // FULL_UNITS mode
        if (idCalculationBasis === 'PAYOUT') {
          fullUnitsCount = Math.ceil(targetPayout / capacityPayout);
          requiredIdsCount = Math.max(1, fullUnitsCount);
          fullIdsCount = requiredIdsCount;
          actualStake = Number((requiredIdsCount * capacityStake).toFixed(2));
          additionalAllocation = Number((actualStake - theoreticalStake).toFixed(2));
          remainingStake = 0;
          remainingPayout = 0;
          lastIdNumber = requiredIdsCount;
          lastIdAmount = capacityStake;
          lastIdPayout = capacityPayout;
          isLastIdPartial = false;
          hasPartialUnit = false;
        } else {
          fullUnitsCount = Math.ceil(theoreticalStake / capacityStake);
          requiredIdsCount = Math.max(1, fullUnitsCount);
          fullIdsCount = requiredIdsCount;
          actualStake = Number((requiredIdsCount * capacityStake).toFixed(2));
          additionalAllocation = Number((actualStake - theoreticalStake).toFixed(2));
          remainingStake = 0;
          remainingPayout = 0;
          lastIdNumber = requiredIdsCount;
          lastIdAmount = capacityStake;
          lastIdPayout = capacityPayout;
          isLastIdPartial = false;
          hasPartialUnit = false;
        }
      }

      if (fullIdsCount > 0) totalFullUnits += fullIdsCount;
      if (isLastIdPartial) totalPartialUnits += 1;
    }

    return {
      id: o.id,
      label: o.label,
      odds: o.odds,
      impliedProb: impliedProbs[idx],
      impliedProbPct: Number((impliedProbs[idx] * 100).toFixed(2)),
      theoreticalStake,
      fullIdsCount,
      remainingStake,
      requiredIdsCount,
      stakePerFullId: capacityStake,
      payoutPerFullId: capacityPayout,
      lastIdNumber,
      lastIdAmount,
      lastIdPayout,
      remainingPayout,
      isLastIdPartial,
      actualStake,
      additionalAllocation,
      fullUnitsCount,
      hasPartialUnit,
      payout: 0,
      profit: 0,
      roiPct: 0,
    };
  });

  const actualTotalInvestment = Number(outcomes.reduce((sum, o) => sum + o.actualStake, 0).toFixed(2));
  const additionalInvestmentTotal = Number((actualTotalInvestment - totalTargetInvestment).toFixed(2));

  outcomes.forEach((o) => {
    o.payout = Number((o.actualStake * o.odds).toFixed(2));
    o.profit = Number((o.payout - actualTotalInvestment).toFixed(2));
    o.roiPct = actualTotalInvestment > 0 ? Number(((o.profit / actualTotalInvestment) * 100).toFixed(2)) : 0;
  });

  const payouts = outcomes.map((o) => o.payout);
  const profits = outcomes.map((o) => o.profit);
  const rois = outcomes.map((o) => o.roiPct);

  const expectedPayoutMin = Math.min(...payouts);
  const expectedPayoutMax = Math.max(...payouts);
  const expectedPayoutAvg = Number((payouts.reduce((a, b) => a + b, 0) / payouts.length).toFixed(2));
  const payoutDifference = Number((expectedPayoutMax - expectedPayoutMin).toFixed(2));

  const expectedProfitMin = Math.min(...profits);
  const expectedProfitMax = Math.max(...profits);
  const expectedProfitAvg = Number((profits.reduce((a, b) => a + b, 0) / profits.length).toFixed(2));

  const expectedRoiMinPct = Math.min(...rois);
  const expectedRoiMaxPct = Math.max(...rois);
  const expectedRoiAvgPct = Number((rois.reduce((a, b) => a + b, 0) / rois.length).toFixed(2));

  const totalIdsRequired = outcomes.reduce((sum, o) => sum + o.requiredIdsCount, 0);
  const maxIdsSingleOutcome = outcomes.length > 0 ? Math.max(...outcomes.map((o) => o.requiredIdsCount)) : 0;

  const isPayoutBalanced = payoutDifference < 0.15;
  const isGuaranteedProfit = isTrueArbitrage && expectedProfitMin >= 0;

  return {
    marketType,
    allocationMode,
    idCalculationBasis,
    totalTargetInvestment,
    maxPayoutPerId: effectiveMaxPayout,
    maxStakePerId: effectiveMaxStake,
    splitDrawIds,
    sumProbability,
    sumProbabilityPct: Number(sumProbabilityPct.toFixed(2)),
    isTrueArbitrage,
    arbitrageMarginPct: Number(arbitrageMarginPct.toFixed(2)),
    theoreticalRoiPct: Number(theoreticalRoiPct.toFixed(2)),
    outcomes,
    actualTotalInvestment,
    additionalInvestmentTotal,
    expectedPayoutMin,
    expectedPayoutMax,
    expectedPayoutAvg,
    payoutDifference,
    expectedProfitMin,
    expectedProfitMax,
    expectedProfitAvg,
    expectedRoiMinPct,
    expectedRoiMaxPct,
    expectedRoiAvgPct,
    totalIdsRequired,
    maxIdsSingleOutcome,
    totalFullUnits,
    totalPartialUnits,
    isPayoutBalanced,
    isGuaranteedProfit,
    reconciliationAdjustment,
  };
}
