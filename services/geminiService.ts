import { GoogleGenAI } from "@google/genai";
import { CalculatedMetrics, FishBatch, GrowthRecord, BatchPerformanceMetrics } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeGrowthData = async (
  batch: FishBatch,
  record: GrowthRecord,
  intervalMetrics: CalculatedMetrics,
  cumulativeMetrics: BatchPerformanceMetrics
): Promise<string> => {
  const client = getAIClient();
  if (!client) return "Unable to connect to AI service. Please check your API key.";

  const prompt = `
    Act as a senior aquaculture specialist. Analyze the following fish growth data and provide actionable advice.
    
    Batch Info:
    - Species: ${batch.species}
    - Age (DOC): ${cumulativeMetrics.daysOfCulture} days
    - Initial Weight: ${batch.initialAvgWeight}g
    - Current Weight: ${record.sampleWeight}g
    
    Performance Indices (Cumulative):
    - Overall FCR: ${cumulativeMetrics.cumulativeFCR}
    - Overall SGR: ${cumulativeMetrics.overallSGR}%/day
    - Survival Rate: ${cumulativeMetrics.overallSurvivalRate}%
    - Total Feed Consumed: ${cumulativeMetrics.totalFeedConsumed} kg
    
    Recent Interval Performance (Last Sample):
    - Interval FCR: ${intervalMetrics.fcr}
    - Interval SGR: ${intervalMetrics.sgr}%/day
    - Daily Weight Gain: ${intervalMetrics.dailyWeightGain}g/day
    
    Provide a concise assessment (3-4 sentences) on whether this performance is good for this species at this stage. 
    Compare the recent interval performance to the overall trend if noteworthy (e.g., FCR spiking).
    Provide 2 specific technical recommendations to improve or maintain growth.
    
    Format the output as plain text with bullet points for recommendations.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Error analyzing data:", error);
    return "Error generating analysis. Please try again later.";
  }
};