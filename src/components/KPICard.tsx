import React from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { KPIData } from '@/types';
import { cn } from '@/lib/utils';

interface KPICardProps {
  data: KPIData;
}

const KPICard: React.FC<KPICardProps> = ({ data }) => {
  const trendOption = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      show: false,
      data: data.trendData?.map((_, i) => i),
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        data: data.trendData,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: data.changeType === 'increase' ? '#F53F3F' : '#00B42A',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: data.changeType === 'increase' ? 'rgba(245, 63, 63, 0.1)' : 'rgba(0, 180, 42, 0.1)',
              },
              {
                offset: 1,
                color: 'rgba(255, 255, 255, 0)',
              },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-neutral-500 text-sm">{data.title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-neutral-700 font-mono">
              {data.value}
            </span>
            {data.unit && <span className="text-neutral-400 text-sm">{data.unit}</span>}
          </div>
          {data.change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm',
                data.changeType === 'increase' ? 'text-danger-500' : 'text-success-500'
              )}
            >
              {data.changeType === 'increase' ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>
                {data.change > 0 ? '+' : ''}
                {data.change}
              </span>
              <span className="text-neutral-400 ml-1">较上周</span>
            </div>
          )}
        </div>
        {data.trendData && (
          <div className="w-24 h-12">
            <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
