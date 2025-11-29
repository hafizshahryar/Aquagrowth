import React, { useState } from 'react';
import { GrowthRecord, FishBatch } from '../types';
import { Scale, Ruler, Utensils } from 'lucide-react';

interface GrowthEntryFormProps {
  batch: FishBatch;
  lastRecord?: GrowthRecord;
  onSave: (record: GrowthRecord) => void;
  onCancel: () => void;
}

export const GrowthEntryForm: React.FC<GrowthEntryFormProps> = ({ batch, lastRecord, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<GrowthRecord, 'id' | 'batchId'>>({
    date: new Date().toISOString().split('T')[0],
    sampleWeight: lastRecord ? lastRecord.sampleWeight : batch.initialAvgWeight,
    totalFeedConsumed: 0,
    currentCount: lastRecord ? lastRecord.currentCount : batch.initialCount,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: crypto.randomUUID(),
      batchId: batch.id
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-2">New Measurement</h2>
      <p className="text-slate-500 text-sm mb-6">Enter the latest sampling data for {batch.name}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Scale className="w-4 h-4 text-slate-400" /> Avg Weight (g)
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.sampleWeight}
              onChange={e => setFormData({...formData, sampleWeight: Number(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Utensils className="w-4 h-4 text-slate-400" /> Feed Used (kg)
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Since last record"
              value={formData.totalFeedConsumed}
              onChange={e => setFormData({...formData, totalFeedConsumed: Number(e.target.value)})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Ruler className="w-4 h-4 text-slate-400" /> Estimated Count
          </label>
          <input
            type="number"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.currentCount}
            onChange={e => setFormData({...formData, currentCount: Number(e.target.value)})}
          />
          <p className="text-xs text-slate-400 mt-1">Update if mortalities occurred.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            placeholder="Water quality, weather, etc."
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm"
        >
          Save Record
        </button>
      </div>
    </form>
  );
};