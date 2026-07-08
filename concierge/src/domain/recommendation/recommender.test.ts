import { describe, expect, it } from 'vitest';

import { recommendProduct } from './recommender';

describe('recommendProduct', () => {
  it('recommends the fee-free everyday account for everyday banking', () => {
    const recommendation = recommendProduct('everyday-banking', '25k-75k');

    expect(recommendation.product.id).toBe('essential');
  });

  it('recommends the multi-currency account for international needs', () => {
    const recommendation = recommendProduct('international', '25k-75k');

    expect(recommendation.product.id).toBe('global');
  });

  it('recommends premier for wealth growth when income qualifies', () => {
    const recommendation = recommendProduct('wealth-growth', '75k-150k');

    expect(recommendation.product.id).toBe('premier');
  });

  it('never recommends a product the customer is ineligible for', () => {
    const recommendation = recommendProduct('wealth-growth', 'under-25k');

    expect(recommendation.product.minimumIncomeBand).toBeUndefined();
  });

  it('surfaces premier as a stretch product one band below its threshold', () => {
    const recommendation = recommendProduct('wealth-growth', '25k-75k');

    expect(recommendation.stretchProduct?.id).toBe('premier');
  });

  it('omits the stretch product when the gap is more than one band', () => {
    const recommendation = recommendProduct('wealth-growth', 'under-25k');

    expect(recommendation.stretchProduct).toBeUndefined();
  });

  it('explains the recommendation in terms of the customer goal', () => {
    const recommendation = recommendProduct('saving', 'under-25k');

    expect(recommendation.reasons[0]).toContain('savings');
  });
});
