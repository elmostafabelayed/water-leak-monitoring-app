import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useWaterSystem } from '../../context/WaterContext';
import { Droplet, Activity, AlertTriangle } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardScreen() {
  const { data, toggleValve, simulateLeak } = useWaterSystem();

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-4 space-y-6">
        
        {/* Simulation de Fuite */}
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity 
            onPress={simulateLeak} 
            className="bg-rose-500/10 border border-rose-500/50 px-3 py-2 rounded-full flex-row items-center gap-2"
          >
            <AlertTriangle size={14} color="#fb7185" />
            <Text className="text-rose-400 text-xs font-bold">Simulate Leak</Text>
          </TouchableOpacity>
        </View>

        {/* Live Flow Rate Card */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 relative overflow-hidden shadow-2xl">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-400 font-bold tracking-widest text-xs uppercase uppercase">Live Flow Rate</Text>
            <View className="flex-row items-center gap-1 bg-cyan-950 px-2 py-1 rounded-full border border-cyan-800">
              <View className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <Text className="text-cyan-400 text-[10px] font-black">NORMAL</Text>
            </View>
          </View>
          
          <View className="flex-row items-baseline gap-2 my-4">
            <Text className="text-6xl font-black text-cyan-400 tracking-tighter tabular-nums">
              {data.flowRate.toFixed(1)}
            </Text>
            <Text className="text-xl text-slate-500 font-medium">L/min</Text>
          </View>

          {/* Bar Chart Simulation */}
          <View className="flex-row items-end gap-1.5 h-16 mt-4 opacity-80">
            {[40, 60, 45, 70, 85, 65, 90, 75, 55, 45].map((height, i) => (
              <View 
                key={i} 
                className={cn(
                  "flex-1 bg-cyan-700/30 rounded-t-sm",
                  i >= 7 ? "bg-cyan-500" : ""
                )} 
                style={{ height: `${height}%` }}
              />
            ))}
          </View>
        </View>

        {/* Valve Control Card */}
        <View className="bg-slate-900 rounded-3xl p-8 border border-slate-800 items-center shadow-2xl">
          <Text className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-8">Main Supply Valve</Text>
          
          <TouchableOpacity 
            onPress={toggleValve}
            className={cn(
              "w-36 h-36 rounded-full border-4 items-center justify-center mb-8 relative",
              data.valveOpen ? "border-cyan-400 bg-cyan-950/40" : "border-slate-700 bg-slate-800/40"
            )}
          >
            <Droplet 
              size={48} 
              color={data.valveOpen ? "#22d3ee" : "#64748b"} 
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Text className="text-3xl font-black text-white mb-1">
              {data.valveOpen ? 'OPEN' : 'CLOSED'}
            </Text>
            <Text className="text-slate-500 text-sm italic">
              {data.valveOpen ? 'Operational • No leaks' : 'Supply secured manually.'}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={toggleValve}
            className={cn(
              "w-full py-5 rounded-2xl flex-row justify-center items-center gap-3",
              data.valveOpen ? "bg-cyan-500" : "bg-slate-800"
            )}
          >
            <Text className={cn(
              "font-black text-sm tracking-widest",
              data.valveOpen ? "text-slate-950" : "text-white"
            )}>
              {data.valveOpen ? 'CLOSE VALVE' : 'OPEN VALVE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Usage Card */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <View className="flex-row items-center gap-3 mb-4">
            <Activity size={20} color="#94a3b8" />
            <Text className="text-white font-bold text-lg">Daily Usage</Text>
          </View>
          
          <View className="flex-row items-baseline gap-2 mb-4">
            <Text className="text-4xl font-black text-white tabular-nums">{Math.floor(data.dailyUsage)}</Text>
            <Text className="text-slate-500 font-medium text-lg">Liters</Text>
          </View>

          <View className="w-full bg-slate-800 rounded-full h-3 mb-3 overflow-hidden">
            <View className="bg-cyan-500 h-full rounded-full" style={{ width: '65%' }} />
          </View>
          <Text className="text-[10px] text-slate-500 font-black uppercase tracking-widest">65% of daily limit</Text>
        </View>

      </View>
    </ScrollView>
  );
}
