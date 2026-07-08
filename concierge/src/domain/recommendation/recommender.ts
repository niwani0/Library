import { INCOME_BAND_ORDER, PRODUCTS, meetsIncomeRequirement } from '../product-catalog';
import type { CustomerGoal, IncomeBand, Product, Recommendation } from '../types';

/**
 * Needs-based recommendation: the customer's stated goal decides the product;
 * income only gates eligibility. Commercial ranking (fee revenue) is never a
 * tiebreaker — when two products fit equally, the cheaper one wins, per the
 * priority ladder (customer-goal and effort outrank commercial).
 */
export function recommendProduct(
  goal: CustomerGoal,
  incomeBand: IncomeBand,
): Recommendation {
  const eligible = PRODUCTS.filter((product) =>
    meetsIncomeRequirement(incomeBand, product.minimumIncomeBand),
  );

  const goalMatches = eligible.filter((product) => product.bestFor.includes(goal));
  const pool = goalMatches.length > 0 ? goalMatches : eligible;
  const best = [...pool].sort(byGoalFitThenLowerFee(goal))[0];
  if (!best) {
    throw new Error('Product catalog must always contain an unrestricted product');
  }

  return {
    product: best,
    reasons: buildReasons(best, goal),
    stretchProduct: findStretchProduct(goal, incomeBand, best),
  };
}

function byGoalFitThenLowerFee(goal: CustomerGoal) {
  return (a: Product, b: Product): number => {
    const aRank = a.bestFor.indexOf(goal);
    const bRank = b.bestFor.indexOf(goal);
    const aFit = aRank === -1 ? Number.MAX_SAFE_INTEGER : aRank;
    const bFit = bRank === -1 ? Number.MAX_SAFE_INTEGER : bRank;
    if (aFit !== bFit) {
      return aFit - bFit;
    }
    return a.monthlyFee - b.monthlyFee;
  };
}

function buildReasons(product: Product, goal: CustomerGoal): string[] {
  const goalPhrases: Record<CustomerGoal, string> = {
    'everyday-banking': 'it covers day-to-day banking without getting in your way',
    saving: 'its savings pots do the heavy lifting automatically',
    international: 'it is built for money that crosses borders',
    'wealth-growth': 'it opens the door to advisory support as your wealth grows',
    'moving-country': 'it works before, during, and after your move',
  };
  const reasons = [goalPhrases[goal]];
  if (product.monthlyFee === 0) {
    reasons.push('there is no monthly fee, so it costs nothing to hold');
  }
  return reasons;
}

/**
 * A stretch product is only mentioned when the customer is exactly one income
 * band below its threshold — a fact worth knowing, not an upsell push.
 */
function findStretchProduct(
  goal: CustomerGoal,
  incomeBand: IncomeBand,
  chosen: Product,
): Product | undefined {
  return PRODUCTS.find((product) => {
    if (product.id === chosen.id || !product.minimumIncomeBand) {
      return false;
    }
    if (!product.bestFor.includes(goal)) {
      return false;
    }
    const gap =
      INCOME_BAND_ORDER.indexOf(product.minimumIncomeBand) -
      INCOME_BAND_ORDER.indexOf(incomeBand);
    return gap === 1;
  });
}
