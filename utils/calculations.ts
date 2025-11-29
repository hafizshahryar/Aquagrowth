import { FishBatch, GrowthRecord, CalculatedMetrics, BatchPerformanceMetrics } from '../types';

export const calculateDaysBetween = (start: string, end: string): number => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
};

export const calculateMetrics = (
  batch: FishBatch,
  record: GrowthRecord,
  previousRecord?: GrowthRecord
): CalculatedMetrics => {
  // Use previous record if available for interval calculation, otherwise batch start
  const startWeight = previousRecord ? previousRecord.sampleWeight : batch.initialAvgWeight;
  const startDate = previousRecord ? previousRecord.date : batch.startDate;
  const startCount = previousRecord ? previousRecord.currentCount : batch.initialCount;

  const days = calculateDaysBetween(startDate, record.date);
  
  // Specific Growth Rate (SGR) = (ln(Wf) - ln(Wi)) / days * 100
  const sgr = ((Math.log(record.sampleWeight) - Math.log(startWeight)) / days) * 100;

  // Daily Weight Gain (DWG) = (Wf - Wi) / days
  const dailyWeightGain = (record.sampleWeight - startWeight) / days;

  // Biomass Gain (kg) = (Current Biomass - Previous Biomass)
  // Biomass = (Avg Weight (g) * Count) / 1000
  const currentBiomass = (record.sampleWeight * record.currentCount) / 1000;
  const previousBiomass = (startWeight * startCount) / 1000;
  const biomassGain = currentBiomass - previousBiomass;

  // Feed Conversion Ratio (FCR) = Feed Given / Weight Gain
  // Handle edge case where gain is 0 or negative to avoid Infinity
  const fcr = biomassGain > 0 ? record.totalFeedConsumed / biomassGain : 0;

  // Survival Rate
  const survivalRate = (record.currentCount / batch.initialCount) * 100;

  return {
    sgr: parseFloat(sgr.toFixed(2)),
    fcr: parseFloat(fcr.toFixed(2)),
    survivalRate: parseFloat(survivalRate.toFixed(2)),
    dailyWeightGain: parseFloat(dailyWeightGain.toFixed(2)),
    biomass: parseFloat(currentBiomass.toFixed(2))
  };
};

export const calculateBatchPerformance = (
  batch: FishBatch,
  records: GrowthRecord[]
): BatchPerformanceMetrics => {
  if (records.length === 0) {
    return {
      daysOfCulture: 0,
      currentBiomass: (batch.initialCount * batch.initialAvgWeight) / 1000,
      totalFeedConsumed: 0,
      totalWeightGain: 0,
      cumulativeFCR: 0,
      overallSGR: 0,
      overallSurvivalRate: 100,
      averageDailyGain: 0
    };
  }

  // Sort records ascending by date
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestRecord = sortedRecords[sortedRecords.length - 1];
  
  const daysOfCulture = calculateDaysBetween(batch.startDate, latestRecord.date);
  
  const totalFeedConsumed = sortedRecords.reduce((sum, r) => sum + r.totalFeedConsumed, 0);
  
  const currentBiomass = (latestRecord.sampleWeight * latestRecord.currentCount) / 1000;
  const initialBiomass = (batch.initialAvgWeight * batch.initialCount) / 1000;
  const totalWeightGain = currentBiomass - initialBiomass;
  
  // Cumulative FCR = Total Feed / Total Weight Gain
  const cumulativeFCR = totalWeightGain > 0 ? totalFeedConsumed / totalWeightGain : 0;
  
  // Overall SGR = (ln(Final Weight) - ln(Initial Weight)) / Total Days * 100
  const overallSGR = ((Math.log(latestRecord.sampleWeight) - Math.log(batch.initialAvgWeight)) / daysOfCulture) * 100;
  
  const overallSurvivalRate = (latestRecord.currentCount / batch.initialCount) * 100;
  
  const averageDailyGain = (latestRecord.sampleWeight - batch.initialAvgWeight) / daysOfCulture;

  return {
    daysOfCulture,
    currentBiomass: parseFloat(currentBiomass.toFixed(2)),
    totalFeedConsumed: parseFloat(totalFeedConsumed.toFixed(2)),
    totalWeightGain: parseFloat(totalWeightGain.toFixed(2)),
    cumulativeFCR: parseFloat(cumulativeFCR.toFixed(2)),
    overallSGR: parseFloat(overallSGR.toFixed(2)),
    overallSurvivalRate: parseFloat(overallSurvivalRate.toFixed(2)),
    averageDailyGain: parseFloat(averageDailyGain.toFixed(2))
  };
};