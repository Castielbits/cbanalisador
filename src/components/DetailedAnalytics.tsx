import React, { useMemo } from 'react';
import { AnalysisReport } from '../types';

interface Props {
  history: AnalysisReport[];
}

const DetailedAnalytics: React.FC<Props> = ({ history }) => {
  const analytics = useMemo(() => {
    if (history.length === 0) {
      return {
        bestStrengths: [],
        commonWeaknesses: [],
        topActions: [],
        performanceByDay: {},
      };
    }

    // Aggregate strengths
    const strengthsMap = new Map<string, number>();
    history.forEach(item => {
      item.whatWentWell?.forEach(strength => {
        strengthsMap.set(strength, (strengthsMap.get(strength) || 0) + 1);
      });
    });

    const bestStrengths = Array.from(strengthsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strength, count]) => ({ strength, count }));

    // Aggregate weaknesses
    const weaknessesMap = new Map<string, number>();
    history.forEach(item => {
      item.whatToImprove?.forEach(weakness => {
        weaknessesMap.set(weakness, (weaknessesMap.get(weakness) || 0) + 1);
      });
    });

    const commonWeaknesses = Array.from(weaknessesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([weakness, count]) => ({ weakness, count }));

    // Aggregate actions
    const actionsMap = new Map<string, number>();
    history.forEach(item => {
      const action = item.suggestedNextAction?.substring(0, 50);
      if (action) {
        actionsMap.set(action, (actionsMap.get(action) || 0) + 1);
      }
    });

    const topActions = Array.from(actionsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));

    return {
      bestStrengths,
      commonWeaknesses,
      topActions,
    };
  }, [history]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Best Strengths */}
      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Principais Forças
        </h3>

        {analytics.bestStrengths.length > 0 ? (
          <div className="space-y-4">
            {analytics.bestStrengths.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-400">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm line-clamp-2">{item.strength}</p>
                  <p className="text-green-400 text-xs font-bold mt-1">{item.count} menção(ões)</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Sem dados para exibir</p>
        )}
      </div>

      {/* Common Weaknesses */}
      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          Principais Fraquezas
        </h3>

        {analytics.commonWeaknesses.length > 0 ? (
          <div className="space-y-4">
            {analytics.commonWeaknesses.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-red-400">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm line-clamp-2">{item.weakness}</p>
                  <p className="text-red-400 text-xs font-bold mt-1">{item.count} menção(ões)</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Sem dados para exibir</p>
        )}
      </div>

      {/* Top Actions */}
      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff6b00]"></div>
          Ações Recomendadas
        </h3>

        {analytics.topActions.length > 0 ? (
          <div className="space-y-4">
            {analytics.topActions.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ff6b00]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#ff6b00]">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm line-clamp-2">{item.action}</p>
                  <p className="text-[#ff6b00] text-xs font-bold mt-1">{item.count} sugestão(ões)</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Sem dados para exibir</p>
        )}
      </div>
    </div>
  );
};

export default DetailedAnalytics;
