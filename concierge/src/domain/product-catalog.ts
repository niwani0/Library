import type { IncomeBand, Product } from './types';

export const INCOME_BAND_ORDER: IncomeBand[] = [
  'under-25k',
  '25k-75k',
  '75k-150k',
  'over-150k',
];

export const PRODUCTS: Product[] = [
  {
    id: 'essential',
    name: 'Meridian Essential',
    tagline: 'Everyday banking with no monthly fee',
    monthlyFee: 0,
    bestFor: ['everyday-banking', 'saving'],
    keyFeatures: [
      'No monthly fee',
      'Instant payments and card controls',
      'Round-up savings pots at 4.1% AER',
    ],
  },
  {
    id: 'global',
    name: 'Meridian Global',
    tagline: 'Multi-currency banking for international lives',
    monthlyFee: 8,
    bestFor: ['international', 'moving-country'],
    keyFeatures: [
      'Hold and spend in 19 currencies at interbank rates',
      'Free international transfers to 40+ countries',
      'Local account details in UK, EU, and US',
    ],
  },
  {
    id: 'premier',
    name: 'Meridian Premier',
    tagline: 'A dedicated relationship manager and wealth access',
    monthlyFee: 0,
    minimumIncomeBand: '75k-150k',
    bestFor: ['wealth-growth', 'international', 'everyday-banking'],
    keyFeatures: [
      'Dedicated relationship manager',
      'Wealth advisory and preferential rates',
      'Worldwide family travel cover',
    ],
  },
];

export function getProduct(id: string): Product {
  const product = PRODUCTS.find((candidate) => candidate.id === id);
  if (!product) {
    throw new Error(`Unknown product id: ${id}`);
  }
  return product;
}

export function meetsIncomeRequirement(
  band: IncomeBand,
  minimum: IncomeBand | undefined,
): boolean {
  if (!minimum) {
    return true;
  }
  return INCOME_BAND_ORDER.indexOf(band) >= INCOME_BAND_ORDER.indexOf(minimum);
}
