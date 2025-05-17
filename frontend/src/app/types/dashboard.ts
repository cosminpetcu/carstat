
export type Deal = {
  id: number;
  title: string;
  price: number;
  estimated_price: number;
  brand: string;
  model: string;
  images: string[] | string;
  year: number;
  deal_rating: string[] | null;
  mileage: number;
};

export type LocationStat = {
  location: string;
  count: number;
};

export type RatingStat = {
  rating: string;
  count: number;
};

export type BrandStat = {
  brand: string;
  count: number;
  soldCount: number;
  avgSellTime: number;
};

export type ModelStat = {
  brand: string;
  model: string;
  count: number;
  soldCount: number;
  avgPrice: number;
};

export type PriceStat = {
  range: string;
  count: number;
  soldCount: number;
  soldPercentage: number;
};

export type PriceDropStat = {
  car_id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  original_price: number;
  current_price: number;
  drop_amount: number;
  drop_percentage: number;
};

export type DetailedPriceStat = {
  brandPrices: { brand: string; avgPrice: number; count: number }[];
  yearPrices: { year: number; avgPrice: number; count: number }[];
  fuelPrices: { fuelType: string; avgPrice: number; count: number }[];
  transmissionPrices: { transmission: string; avgPrice: number; count: number }[];
};

export type MarketSummary = {
  totalListings: number;
  totalSold: number;
  activeListings: number;
  averageSellTime: number;
  averagePrice: number;
};

export type QualityScoreItem = {
  range: string;
  count: number;
  label: string;
  sellerType?: string;
  avgScore?: number | string;
};

export type QualitySellTimeItem = {
  range: string;
  avgSellTime: number;
  label: string;
};

export type QualityPriceReductionItem = {
  range: string;
  avgReduction: number;
  avgPercentage: number;
  carsCount: number;
  label: string;
};

export type LocationItem = {
  location: string;
  count: number;
};

export type PriceByOriginItem = {
  country: string;
  avgPrice: number;
  count: number;
};

export type SellTimeByOriginItem = {
  country: string;
  avgSellTime: number;
  count: number;
};

export type BrandByOriginItem = {
  brand: string;
  count: number;
};

export type OriginCountryAnalysisData = {
  priceByOrigin: PriceByOriginItem[];
  sellTimeByOrigin: SellTimeByOriginItem[];
  topBrandsByOrigin: Record<string, BrandByOriginItem[]>;
};

export type SellerStatItem = {
  sellerType: string;
  count: number;
  avgPrice: number;
  soldCount: number;
  avgSellTime: number;
};

export type DealRatingItem = {
  sellerType: string;
  dealRating: string;
  count: number;
};

export type DealerVsPrivateData = {
  generalStats: SellerStatItem[];
  dealRatings: DealRatingItem[];
  qualityScores: QualityScoreItem[];
};

export type BrandReliabilityItem = {
  brand: string;
  totalCars: number;
  avgQuality: number | null;
  noAccidentRate: number | null;
  serviceBookRate: number | null;
  firstOwnerRate: number | null;
  goodDealRate: number | null;
  reliabilityScore: number | null;
};

export type YearlyPriceItem = {
  year: number;
  avgPrice: number;
  count: number;
};

export type ModelDepreciationItem = {
  brand: string;
  model: string;
  newestYear: number;
  newestPrice: number;
  yearlyDepreciationRate: number;
  yearlyPrices: YearlyPriceItem[];
};

export type GenerationItem = {
  generation: string;
  avgPrice: number | null;
  avgQuality: number | null;
  avgMileage: number | null;
  count: number;
  soldRate: number | null;
  avgSellTime: number | null;
};

export type GenerationAnalysisItem = {
  brand: string;
  model: string;
  generations: GenerationItem[];
};

export type MileageImpactItem = {
  range: string;
  minMileage: number;
  maxMileage: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  count: number;
  avgSellTime: number | null;
  soldCount: number;
  salesRate: number | null;
  dealRatings: Record<string, number>;
  goodDealsPercentage: number | null;
};

export type IncompleteSourceItem = {
  source: string;
  totalIncomplete: number;
  validCarsAdded: number;
  totalRuns: number;
  successRate: number;
};

export type MissingFieldItem = {
  field: string;
  count: number;
};

export type IncompleteStatsData = {
  totalIncomplete: number;
  totalValid: number;
  successRate: number;
  sources: IncompleteSourceItem[];
  fieldsBreakdown: MissingFieldItem[];
};

export interface PriceStatItem {
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface FactorComparisonItem {
  factor: string;
  suspiciousPercentage: number;
  normalPercentage: number;
  difference: number;
}

export interface SpecificFactorItem {
  suspiciousPercentage: number;
  normalPercentage: number;
  difference: number;
}

export interface SuspiciousListingsData {
  totalSuspicious: number;
  totalListings: number;
  suspiciousPercentage: number;
  factorComparisons: FactorComparisonItem[];
  specificFactors: {
    rightHandDrive: SpecificFactorItem;
    damaged: SpecificFactorItem;
    privateSellers: SpecificFactorItem;
  };
  priceStatistics: {
    suspicious: PriceStatItem;
    normal: PriceStatItem;
  };
  topSuspiciousBrands: {
    brand: string;
    count: number;
    percentage: number;
  }[];
  priceRangesSuspicious: {
    range: string;
    count: number;
  }[];
  incompleteStats: IncompleteStatsData;
}

export interface YearlyPrice {
  year: number;
  avgPrice: number;
  count: number;
}

export interface ModelDepreciation {
  brand: string;
  model: string;
  newestYear: number;
  newestPrice: number;
  yearlyDepreciationRate: number;
  yearlyPrices: YearlyPrice[];
}

export interface GenerationData {
  generation: string;
  avgPrice: number | null;
  avgQuality: number | null;
  avgMileage: number | null;
  count: number;
  soldRate: number | null;
  avgSellTime: number | null;
}

export interface GenerationAnalysis {
  brand: string;
  model: string;
  generations: GenerationData[];
}

export interface ModelsMap {
  [brand: string]: string[];
}