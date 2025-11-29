export interface FishBatch {
  id: string;
  name: string;
  species: string;
  startDate: string;
  initialCount: number;
  initialAvgWeight: number; // in grams
}

export interface GrowthRecord {
  id: string;
  batchId: string;
  date: string;
  sampleWeight: number; // current avg weight in grams
  totalFeedConsumed: number; // total feed given since last record or start in kg
  currentCount: number; // estimated or counted survival
  notes?: string;
}

export interface CalculatedMetrics {
  sgr: number; // Specific Growth Rate (Interval)
  fcr: number; // Feed Conversion Ratio (Interval)
  survivalRate: number;
  dailyWeightGain: number;
  biomass: number;
}

export interface BatchPerformanceMetrics {
  daysOfCulture: number;
  currentBiomass: number; // kg
  totalFeedConsumed: number; // kg
  totalWeightGain: number; // kg
  cumulativeFCR: number; // Overall FCR
  overallSGR: number; // Overall SGR
  overallSurvivalRate: number;
  averageDailyGain: number; // g/day
}

export interface AIAnalysis {
  advice: string;
  status: 'optimal' | 'warning' | 'critical';
  timestamp: number;
}