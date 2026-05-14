import React from 'react';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { SkillUsage } from '../types';

interface SkillsUsageChartProps {
  skills: SkillUsage[];
}

const SkillsUsageChart: React.FC<SkillsUsageChartProps> = ({ skills }) => {
  if (skills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>暂无技能使用数据</p>
      </div>
    );
  }

  const maxCalls = Math.max(...skills.map(s => s.call_count), 1);

  return (
    <div className="space-y-3">
      {skills.map((skill) => (
        <div key={skill.skill_name} className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-yellow-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 truncate">
                {skill.skill_name}
              </span>
              <span className="text-xs text-gray-500">
                {skill.call_count} 次
              </span>
            </div>
            
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(skill.call_count / maxCalls * 100) || 0}%` }}
                />
              </div>
              <span className={`text-xs ${
                skill.success_rate >= 0.9 ? 'text-green-600' : 
                skill.success_rate >= 0.7 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(skill.success_rate * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsUsageChart;
