import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useWaterSystem } from '../../context/WaterContext';
import { ShieldCheck, ArrowDownToLine, Wifi } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mockChartData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  flow: 10 + Math.random() * 5 + (i > 15 ? Math.random() * 10 : 0)
}));

export default function StatsScreen() {
  const { data } = useWaterSystem();
  const [chartData, setChartData] = useState(mockChartData);

  useEffect(() => {
    if (!data.valveOpen) return;
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, flow: data.flowRate + (Math.random() * 2 - 1) }];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [data.flowRate, data.valveOpen]);

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-4 space-y-6">
        
        {/* Header Info */}
        <View className="mb-4 px-2">
          <Text className="text-3xl font-black text-white mb-1 tracking-tight">Live Monitoring</Text>
          <Text className="text-slate-500 text-sm mb-4">System Active & Scanning</Text>
          
          <View className="flex-row items-center gap-2 bg-slate-900 self-start px-4 py-2 rounded-full border border-slate-800">
            <View className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <Text className="text-[10px] font-black text-slate-300 tracking-widest uppercase">ESP32 CONNECTED</Text>
          </View>
        </View>

        {/* Pressure Card */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
          <View className="flex-row justify-between items-start mb-4">
            <ArrowDownToLine size={24} color="#22d3ee" />
            <View className="bg-cyan-950 px-3 py-1 rounded-sm border border-cyan-800">
              <Text className="text-cyan-400 text-[10px] font-black tracking-widest uppercase">OPTIMAL</Text>
            </View>
          </View>
          
          <View className="flex-row items-baseline gap-2 mb-2">
            <Text className="text-5xl font-black text-white tabular-nums tracking-tighter">
              {data.pressure.toFixed(1)}
            </Text>
            <Text className="text-lg text-slate-500 font-bold uppercase">PSI</Text>
          </View>
          <Text className="text-slate-500 text-xs font-black tracking-widest uppercase">Water Pressure</Text>
          
          <View className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <View className="bg-cyan-500 h-full" style={{ width: '70%' }} />
          </View>
        </View>

        {/* Status Card */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="p-3 bg-cyan-500/10 rounded-2xl">
              <ShieldCheck size={32} color="#22d3ee" />
            </View>
            <View>
              <Text className="text-3xl font-black text-white">Healthy</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <Text className="text-slate-500 text-xs font-bold uppercase">Pipe Status: Safe</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Telemetry Chart */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <View className="flex-row justify-between items-start mb-8">
            <View>
              <Text className="text-white font-black text-lg tracking-tight">Flow Telemetry</Text>
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">(60s Realtime)</Text>
            </View>
            <View className="items-end gap-1">
               <View className="flex-row items-center gap-2">
                 <View className="w-2 h-2 rounded-full bg-cyan-400" />
                 <Text className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Live</Text>
               </View>
            </View>
          </View>

          {/* Bar Chart Realtime Simulation */}
          <View className="flex-row items-end gap-1.5 h-32 opacity-90">
            {chartData.map((item, i) => (
              <View 
                key={i} 
                className={cn(
                  "flex-1 bg-cyan-500/40 rounded-t-sm",
                  i === chartData.length - 1 ? "bg-cyan-400" : ""
                )} 
                style={{ height: `${Math.min(100, item.flow * 2)}%` }}
              />
            ))}
          </View>

          <View className="flex-row justify-between mt-4">
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">60s ago</Text>
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Now</Text>
          </View>
        </View>

        {/* Diagnostics Table */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <Text className="text-white font-black text-lg mb-6 tracking-tight">Technical Diagnostics</Text>
          
          <View className="space-y-4">
            <DiagRow label="Node ID" value="WLG-ESP32-X88" />
            <DiagRow label="Uptime" value="14d 06h 22m" />
            <DiagRow label="Signal" value={`${data.signalStrength} dBm`} />
            <DiagRow label="Firmware" value="v2.4.1-stable" last />
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

function DiagRow({ label, value, last }: { label: string, value: string, last?: boolean }) {
  return (
    <View className={cn(
      "flex-row justify-between items-center py-3 border-slate-800",
      !last && "border-b"
    )}>
      <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{label}</Text>
      <Text className="text-white font-black text-xs uppercase">{value}</Text>
    </View>
  );
}
