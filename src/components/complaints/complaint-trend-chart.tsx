'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ComplaintTrendData } from '@/types/complaints';

interface ComplaintTrendChartProps {
  data: ComplaintTrendData[];
  type?: 'line' | 'bar';
  height?: number;
}

export function ComplaintTrendChart({
  data,
  type = 'line',
  height = 400,
}: ComplaintTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-none border border-gray-200 p-8">
        <p className="text-gray-500">No complaint data available</p>
      </div>
    );
  }

  const colors = {
    count: '#0d4a2d',
    poorGermination: '#ef4444',
    stuntedGrowth: '#f97316',
    noYield: '#eab308',
    pestSusceptibility: '#06b6d4',
    physicalImpurity: '#8b5cf6',
    other: '#6b7280',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-none shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <DataComponent
          dataKey="poorGermination"
          stroke={colors.poorGermination}
          fill={colors.poorGermination}
          name="Poor Germination"
          isAnimationActive={true}
        />
        <DataComponent
          dataKey="stuntedGrowth"
          stroke={colors.stuntedGrowth}
          fill={colors.stuntedGrowth}
          name="Stunted Growth"
          isAnimationActive={true}
        />
        <DataComponent
          dataKey="noYield"
          stroke={colors.noYield}
          fill={colors.noYield}
          name="No Yield"
          isAnimationActive={true}
        />
        <DataComponent
          dataKey="pestSusceptibility"
          stroke={colors.pestSusceptibility}
          fill={colors.pestSusceptibility}
          name="Pest Susceptibility"
          isAnimationActive={true}
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
}
