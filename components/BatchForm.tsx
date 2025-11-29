import React, { useState } from 'react';
import { FishBatch } from '../types';
import { Plus } from 'lucide-react';
import { generateId } from '../utils/calculations';

interface BatchFormProps {
  onSave: (batch: FishBatch) => void;
  onCancel: () => void;
}

export const BatchForm: React.FC<BatchFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<FishBatch, 'id'>>({
    name: '',
    species: 'Tilapia',
    startDate: new Date().toISOString().split('T')[0],
    initialCount: 1000,
    initialAvgWeight: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: generateId()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-blue-600" />
        Start New Batch
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="e.g., Tank 1 - Spring"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Species</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={formData.species}
            onChange={e => setFormData({...formData, species: e.target.value})}
          >
            <option value="Tilapia">Tilapia</option>
            <option value="Catfish">Catfish</option>
            <option value="Trout">Trout</option>
            <option value="Salmon">Salmon</option>
            <option value="Carp">Carp</option>
            <option value="Shrimp">Shrimp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock Count</label>
          <input
            type="number"
            min="1"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={formData.initialCount}
            onChange={e => setFormData({...formData, initialCount: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Avg Start Weight (g)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={formData.initialAvgWeight}
            onChange={e => setFormData({...formData, initialAvgWeight: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
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
          Create Batch
        </button>
      </div>
    </form>
  );
};