import React, { useState, useEffect } from 'react';
import { FishBatch, GrowthRecord, CalculatedMetrics, BatchPerformanceMetrics } from './types';
import { BatchForm } from './components/BatchForm';
import { GrowthEntryForm } from './components/GrowthEntryForm';
import { EmptyState } from './components/EmptyState';
import { MetricsCard } from './components/MetricsCard';
import { ChartSection } from './components/ChartSection';
import { calculateMetrics, calculateBatchPerformance } from './utils/calculations';
import { analyzeGrowthData } from './services/geminiService';
import { 
  Anchor, 
  Activity, 
  Scale, 
  UtensilsCrossed, 
  Trash2, 
  Plus, 
  TrendingUp, 
  Sparkles,
  ChevronLeft,
  Download,
  Calendar,
  BarChart3,
  Fish
} from 'lucide-react';

// Main App Component
const App: React.FC = () => {
  // State
  const [batches, setBatches] = useState<FishBatch[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [records, setRecords] = useState<Record<string, GrowthRecord[]>>({});
  const [view, setView] = useState<'list' | 'create_batch' | 'details' | 'add_record'>('list');
  
  // Analysis State
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedBatches = localStorage.getItem('aqua_batches');
    const savedRecords = localStorage.getItem('aqua_records');
    if (savedBatches) setBatches(JSON.parse(savedBatches));
    if (savedRecords) setRecords(JSON.parse(savedRecords));
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('aqua_batches', JSON.stringify(batches));
    localStorage.setItem('aqua_records', JSON.stringify(records));
  }, [batches, records]);

  // Derived State
  const activeBatch = batches.find(b => b.id === activeBatchId);
  const activeRecords = activeBatchId ? (records[activeBatchId] || []) : [];
  
  // Sort records by date descending for list
  const sortedRecords = [...activeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRecord = sortedRecords[0];
  const previousRecord = sortedRecords[1];

  // Calculate Interval Metrics (for the latest period)
  const currentMetrics: CalculatedMetrics | null = activeBatch && latestRecord 
    ? calculateMetrics(activeBatch, latestRecord, previousRecord)
    : null;

  // Calculate Cumulative/Overall Performance Metrics
  const performanceMetrics: BatchPerformanceMetrics | null = activeBatch
    ? calculateBatchPerformance(activeBatch, activeRecords)
    : null;

  // Handlers
  const handleSaveBatch = (batch: FishBatch) => {
    setBatches([...batches, batch]);
    setRecords({ ...records, [batch.id]: [] });
    setView('list');
  };

  const handleSaveRecord = (record: GrowthRecord) => {
    const batchRecords = records[record.batchId] || [];
    const newRecords = {
      ...records,
      [record.batchId]: [...batchRecords, record]
    };
    setRecords(newRecords);
    setView('details');
    setAiAdvice(null);
  };

  const deleteBatch = (id: string) => {
    if (confirm('Are you sure you want to delete this batch and all its data?')) {
      const newBatches = batches.filter(b => b.id !== id);
      const newRecords = { ...records };
      delete newRecords[id];
      setBatches(newBatches);
      setRecords(newRecords);
      if (activeBatchId === id) {
        setActiveBatchId(null);
        setView('list');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!activeBatch || !latestRecord || !currentMetrics || !performanceMetrics) return;
    
    setIsAnalyzing(true);
    const advice = await analyzeGrowthData(activeBatch, latestRecord, currentMetrics, performanceMetrics);
    setAiAdvice(advice);
    setIsAnalyzing(false);
  };

  const handleExportCSV = () => {
    if (!activeBatch) return;

    // Header
    const headers = [
      'Date', 
      'Avg Weight (g)', 
      'Biomass (kg)', 
      'Feed Used (kg)', 
      'Est. Count', 
      'Survival Rate (%)', 
      'Interval FCR', 
      'Interval SGR (%)', 
      'Notes'
    ];
    
    // Rows
    const rows = sortedRecords.map((record, index) => {
      // Find previous record for interval calc
      // Note: sortedRecords is Descending. Next item is previous in time.
      const prev = sortedRecords[index + 1];
      const m = calculateMetrics(activeBatch, record, prev);
      
      return [
        record.date,
        record.sampleWeight,
        m.biomass,
        record.totalFeedConsumed,
        record.currentCount,
        m.survivalRate,
        m.fcr,
        m.sgr,
        `"${record.notes || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [`Batch: ${activeBatch.name} (${activeBatch.species})`, headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeBatch.name.replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Views
  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('list'); setActiveBatchId(null); }}>
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">AquaGrowth AI</h1>
        </div>
        
        {/* Desktop Action Button */}
        {view === 'list' && (
          <button 
            onClick={() => setView('create_batch')}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Batch</span>
          </button>
        )}
      </div>
    </header>
  );

  const renderBatchList = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-slate-500" />
          Active Batches
        </h2>
      </div>
      
      {batches.length === 0 ? (
        <EmptyState 
          title="No fish batches yet" 
          description="Start tracking your fish growth performance by creating your first batch."
          action={
            <button 
              onClick={() => setView('create_batch')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Start First Batch
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => {
            const batchRecords = records[batch.id] || [];
            const lastUpdate = batchRecords.length > 0 
              ? new Date(batchRecords[batchRecords.length - 1].date).toLocaleDateString() 
              : 'No records';
            
            const summary = calculateBatchPerformance(batch, batchRecords);
            
            return (
              <div 
                key={batch.id}
                onClick={() => { setActiveBatchId(batch.id); setView('details'); }}
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer relative active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Fish className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{batch.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{batch.species}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${batchRecords.length > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    DOC: {summary.daysOfCulture}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Last Update</span>
                    <span className="text-slate-900 font-medium">{lastUpdate}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Biomass</span>
                    <span className="text-slate-900 font-medium">{summary.currentBiomass.toLocaleString()} kg</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                      <p className="text-xs text-slate-500">FCR (Cum)</p>
                      <p className="font-bold text-slate-800">{summary.cumulativeFCR}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                      <p className="text-xs text-slate-500">Survival</p>
                      <p className="font-bold text-slate-800">{summary.overallSurvivalRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                   <p className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                     View Performance <ChevronLeft className="w-4 h-4 rotate-180" />
                   </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => setView('create_batch')}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-50 safe-pb"
        aria-label="Create New Batch"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );

  const renderDashboard = () => {
    if (!activeBatch) return null;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setView('list'); setActiveBatchId(null); setAiAdvice(null); }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{activeBatch.name}</h2>
              <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{activeBatch.species}</span> 
                <span>•</span> 
                Started {new Date(activeBatch.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => deleteBatch(activeBatch.id)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
            <button 
              onClick={() => setView('add_record')}
              className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>

        {/* Performance Indices Section */}
        {latestRecord && performanceMetrics ? (
          <div className="space-y-8">
            {/* Cumulative Performance Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Overall Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <MetricsCard 
                  title="Cumulative FCR" 
                  value={performanceMetrics.cumulativeFCR} 
                  icon={<UtensilsCrossed className="w-5 h-5 text-indigo-600" />}
                  color={performanceMetrics.cumulativeFCR > 1.5 ? 'orange' : 'green'}
                  unit=""
                />
                <MetricsCard 
                  title="Overall SGR" 
                  value={performanceMetrics.overallSGR} 
                  unit="%/day"
                  icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
                  color="blue"
                />
                 <MetricsCard 
                  title="Survival" 
                  value={performanceMetrics.overallSurvivalRate} 
                  unit="%"
                  icon={<Activity className="w-5 h-5 text-indigo-600" />}
                  color={performanceMetrics.overallSurvivalRate < 80 ? 'red' : 'green'}
                />
                 <MetricsCard 
                  title="Biomass" 
                  value={performanceMetrics.currentBiomass} 
                  unit="kg"
                  icon={<Scale className="w-5 h-5 text-indigo-600" />}
                  color="blue"
                />
              </div>
            </div>

            {/* Interval/Recent Performance Section */}
            {currentMetrics && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Latest Sample ({new Date(latestRecord.date).toLocaleDateString()})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <MetricsCard 
                    title="Avg Weight" 
                    value={latestRecord.sampleWeight} 
                    unit="g"
                    icon={<Scale className="w-5 h-5 text-emerald-600" />}
                    color="green"
                  />
                   <MetricsCard 
                    title="Interval FCR" 
                    value={currentMetrics.fcr} 
                    icon={<UtensilsCrossed className="w-5 h-5 text-emerald-600" />}
                    color={currentMetrics.fcr > 2.0 ? 'orange' : 'green'}
                  />
                   <MetricsCard 
                    title="Interval SGR" 
                    value={currentMetrics.sgr} 
                    unit="%"
                    icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                    color="green"
                  />
                  <MetricsCard 
                    title="Gain/Day" 
                    value={currentMetrics.dailyWeightGain} 
                    unit="g"
                    icon={<Activity className="w-5 h-5 text-emerald-600" />}
                    color="green"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8">
            <EmptyState 
              title="No data available" 
              description="Add your first growth measurement."
            />
          </div>
        )}

        {/* Charts */}
        {activeRecords.length > 0 && (
          <div className="mt-8">
            <ChartSection batch={activeBatch} records={activeRecords} />
          </div>
        )}

        {/* AI Advisor Section */}
        {latestRecord && currentMetrics && performanceMetrics && (
          <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800">AI Analyst</h3>
                   <p className="text-sm text-slate-500">Gemini 2.5 Flash</p>
                </div>
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isAnalyzing 
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : aiAdvice ? 'Refresh' : 'Analyze'}
              </button>
            </div>
            
            {aiAdvice ? (
              <div className="bg-white/80 p-4 rounded-lg border border-indigo-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {aiAdvice}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                Get instant insights on your FCR trends and growth performance.
              </p>
            )}
          </div>
        )}

        {/* History Table */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Logs</h3>
            <span className="text-xs text-slate-500">{activeRecords.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">Weight</th>
                  <th className="px-4 py-3 whitespace-nowrap">FCR</th>
                  <th className="px-4 py-3 whitespace-nowrap">SGR</th>
                  <th className="px-4 py-3 whitespace-nowrap">Surv%</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRecords.length > 0 ? (
                  sortedRecords.map((record, index) => {
                    const prev = sortedRecords[index + 1];
                    const metrics = calculateMetrics(activeBatch, record, prev);
                    
                    return (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-900 whitespace-nowrap">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">{record.sampleWeight}g</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            metrics.fcr > 0 && metrics.fcr < 1.5 ? 'bg-green-100 text-green-700' : 
                            metrics.fcr >= 1.5 && metrics.fcr < 2.0 ? 'bg-orange-100 text-orange-700' :
                            metrics.fcr >= 2.0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {metrics.fcr > 0 ? metrics.fcr : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-indigo-600">{metrics.sgr}%</td>
                        <td className="px-4 py-4">{metrics.survivalRate}%</td>
                        <td className="px-4 py-4 text-slate-500 max-w-[150px] truncate">{record.notes || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Floating Action Button for Add Record */}
        <button 
          onClick={() => setView('add_record')}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-50 safe-pb"
          aria-label="Add Measurement"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-safe font-sans">
      {renderHeader()}
      
      <main className="safe-pb">
        {view === 'list' && renderBatchList()}
        
        {view === 'create_batch' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <BatchForm 
              onSave={handleSaveBatch} 
              onCancel={() => setView('list')} 
            />
          </div>
        )}

        {view === 'add_record' && activeBatch && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <GrowthEntryForm 
              batch={activeBatch}
              lastRecord={latestRecord}
              onSave={handleSaveRecord}
              onCancel={() => setView('details')}
            />
          </div>
        )}

        {view === 'details' && renderDashboard()}
      </main>
    </div>
  );
};

export default App;