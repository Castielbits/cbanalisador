import React, { useState } from 'react';
import { AnalysisReport } from '../types';

interface Props {
  history: AnalysisReport[];
  onFilter: (filtered: AnalysisReport[]) => void;
}

const DashboardFilters: React.FC<Props> = ({ history, onFilter }) => {
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [classification, setClassification] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const applyFilters = () => {
    let filtered = [...history];

    // Filter by score range
    filtered = filtered.filter(h => h.overallScore >= scoreRange[0] && h.overallScore <= scoreRange[1]);

    // Filter by classification
    if (classification) {
      filtered = filtered.filter(h => h.classification === classification);
    }

    // Filter by date range
    const now = new Date();
    let startDate = new Date(0);

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    filtered = filtered.filter(h => new Date(h.date) >= startDate);

    onFilter(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [scoreRange, classification, dateRange]);

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-6">
      <h3 className="text-lg font-bold text-white">Filtros</h3>

      {/* Score Range */}
      <div>
        <label className="text-white/70 text-sm font-medium mb-3 block">
          Score: {scoreRange[0]} - {scoreRange[1]}
        </label>
        <div className="flex gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={scoreRange[0]}
            onChange={(e) => setScoreRange([parseInt(e.target.value), scoreRange[1]])}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff6b00]"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={scoreRange[1]}
            onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff6b00]"
          />
        </div>
      </div>

      {/* Classification */}
      <div>
        <label className="text-white/70 text-sm font-medium mb-3 block">Classificação</label>
        <div className="flex gap-2">
          {['Quente', 'Morna', 'Fria'].map((cls) => (
            <button
              key={cls}
              onClick={() => setClassification(classification === cls ? null : cls)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                classification === cls
                  ? 'bg-[#ff6b00] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="text-white/70 text-sm font-medium mb-3 block">Período</label>
        <div className="grid grid-cols-4 gap-2">
          {(['all', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dateRange === range
                  ? 'bg-[#ff6b00] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {range === 'all' ? 'Tudo' : range === 'week' ? '7d' : range === 'month' ? '30d' : '1a'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
