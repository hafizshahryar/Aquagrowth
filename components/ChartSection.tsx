import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { GrowthRecord, FishBatch } from '../types';
import { calculateMetrics } from '../utils/calculations';

interface ChartSectionProps {
  batch: FishBatch;
  records: GrowthRecord[];
}

export const ChartSection: React.FC<ChartSectionProps> = ({ batch, records }) => {
  if (records.length === 0) return null;

  // Prepare data for charts. 
  // We need to calculate metrics for each point in time relative to the previous point or start.
  const chartData = records.map((record, index) => {
    const prevRecord = index > 0 ? records[index - 1] : undefined;
    const metrics = calculateMetrics(batch, record, prevRecord);
    return {
      date: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: record.sampleWeight,
      fcr: metrics.fcr,
      sgr: metrics.sgr,
      biomass: metrics.biomass
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Add initial point for weight chart
  const weightData = [
    { date: 'Start', weight: batch.initialAvgWeight, fcr: 0, sgr: 0, biomass: (batch.initialCount * batch.initialAvgWeight)/1000 },
    ...chartData
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Weight Growth Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Growth Curve (Weight)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 12}} label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: '#64748b'} }} />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="weight" name="Avg Weight (g)" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FCR & SGR Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Efficiency Metrics (FCR & SGR)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#64748b" />
              <YAxis yAxisId="left" orientation="left" stroke="#059669" tick={{fontSize: 12}} label={{ value: 'FCR', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: '#059669'} }} />
              <YAxis yAxisId="right" orientation="right" stroke="#7c3aed" tick={{fontSize: 12}} label={{ value: 'SGR (%)', angle: 90, position: 'insideRight', style: {textAnchor: 'middle', fill: '#7c3aed'} }} />
              <Tooltip 
                 cursor={{fill: '#f1f5f9'}}
                 contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="fcr" name="FCR" fill="#059669" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="sgr" name="SGR %" stroke="#7c3aed" strokeWidth={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};