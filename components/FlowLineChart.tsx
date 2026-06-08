import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, chartConfig } from '../constants/Theme';
import { safeChartSeries } from '../utils/safe';

export interface FlowHistoryPoint {
  time: string;
  label: string;
  flow: number;
  isAnomaly?: boolean;
}

interface FlowLineChartProps {
  data: FlowHistoryPoint[];
  height?: number;
}

export default function FlowLineChart({ data, height = 180 }: FlowLineChartProps) {
  const { width } = useWindowDimensions();
  const screenWidth = width - 32;
  const labels = data
    .filter((_, i) => i % 10 === 0 || i === data.length - 1)
    .map((d) => d.label);

  const values = safeChartSeries(data.map((d) => d.flow), 2);
  const hasAnomaly = data.some((d) => d.isAnomaly || d.flow > 20);

  return (
    <View>
      <LineChart
        data={{
          labels: labels.length > 0 ? labels : ['—'],
          datasets: [{ data: values, strokeWidth: 2 }],
        }}
        width={screenWidth}
        height={height}
        chartConfig={{
          ...chartConfig,
          propsForDots: {
            r: '3',
            strokeWidth: '1',
          },
        }}
        getDotColor={(dataPoint) => (dataPoint > 20 ? COLORS.danger : COLORS.accent)}
        bezier
        style={{ borderRadius: 16, marginLeft: -8 }}
        withInnerLines
        withOuterLines={false}
        fromZero
        yAxisSuffix=""
        segments={4}
      />
      <View className="flex-row justify-between mt-2 px-1">
        <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          -60 min
        </Text>
        <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          Maintenant
        </Text>
      </View>
      {hasAnomaly && (
        <View className="flex-row items-center gap-2 mt-2">
          <View className="w-2 h-2 rounded-full bg-red-500" />
          <Text className="text-red-400 text-[9px] font-black uppercase tracking-widest">
            Pic anormal détecté
          </Text>
        </View>
      )}
    </View>
  );
}
