import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useWaterSystem, type Alert } from '../../context/WaterContext';
import { BellRing, ShieldAlert, Activity, CheckCircle, Clock } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AlertsScreen() {
  const { alerts, acknowledgeAlert } = useWaterSystem();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'SYSTEM'>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL' || a.severity === 'HIGH';
    if (filter === 'SYSTEM') return a.type === 'SYSTEM' || a.type === 'ACTION';
    return true;
  });

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-4">
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-white mb-4 tracking-tight">Event Logs</Text>
          <View className="flex-row gap-2">
            <FilterPill label="All" active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
            <FilterPill label="Critical" active={filter === 'CRITICAL'} onPress={() => setFilter('CRITICAL')} />
            <FilterPill label="System" active={filter === 'SYSTEM'} onPress={() => setFilter('SYSTEM')} />
          </View>
        </View>

        {/* Timeline */}
        <View className="border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {filteredAlerts.length === 0 ? (
            <Text className="text-slate-500 italic text-sm py-4">No events found.</Text>
          ) : (
            filteredAlerts.map((alert, index) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onAcknowledge={() => acknowledgeAlert(alert.id)}
                isLatest={index === 0}
              />
            ))
          )}
        </View>

        {/* Info Archive */}
        <View className="mt-12 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-8 items-center">
          <Clock size={32} color="#475569" className="mb-3 opacity-50" />
          <Text className="text-[10px] text-slate-500 text-center font-black uppercase tracking-widest leading-4">
            Viewing data from the last 30 days. Older logs are archived in the cloud repository.
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

function FilterPill({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={cn(
        "px-5 py-2 rounded-full border",
        active 
          ? "bg-cyan-950 border-cyan-800" 
          : "bg-slate-900 border-slate-800"
      )}
    >
      <Text className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        active ? "text-cyan-400" : "text-slate-500"
      )}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function AlertCard({ alert, onAcknowledge, isLatest }: { alert: Alert, onAcknowledge: () => void, isLatest: boolean }) {
  const styles = {
    CRITICAL: { bg: 'bg-rose-950/20', border: 'border-rose-900/50', line: 'bg-rose-500', color: '#fb7185', icon: ShieldAlert },
    HIGH: { bg: 'bg-orange-950/20', border: 'border-orange-900/50', line: 'bg-orange-500', color: '#fb923c', icon: BellRing },
    MEDIUM: { bg: 'bg-yellow-950/20', border: 'border-yellow-900/50', line: 'bg-yellow-500', color: '#facc15', icon: Activity },
    LOW: { bg: 'bg-slate-900', border: 'border-slate-800', line: 'bg-cyan-500', color: '#22d3ee', icon: CheckCircle },
  }[alert.severity];

  const Icon = styles.icon;

  return (
    <View className="relative">
      {/* Timeline Dot */}
      <View className={cn(
        "absolute -left-[31px] top-6 w-3.5 h-3.5 rounded-full border-4 border-slate-950 z-10",
        styles.line
      )} />

      <View className={cn(
        "rounded-3xl p-5 border shadow-2xl overflow-hidden",
        styles.bg, styles.border,
        !alert.acknowledged && "border-white/20"
      )}>
        {!alert.acknowledged && (
          <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500" />
        )}

        <View className="flex-row gap-4">
          <View className="p-3 rounded-2xl bg-black/20 h-fit">
            <Icon size={20} color={styles.color} />
          </View>
          <View className="flex-1">
            <Text className="font-black text-white text-base mb-1 tracking-tight">{alert.title}</Text>
            <Text className="text-slate-400 text-sm mb-4 leading-5">{alert.description}</Text>
            
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Clock size={12} color="#64748b" />
                <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View className={cn("px-2 py-0.5 rounded-sm border", styles.border)}>
                <Text className={cn("font-black uppercase text-[8px] tracking-[2px]", { color: styles.color })}>
                  {alert.severity}
                </Text>
              </View>
            </View>

            {!alert.acknowledged && (
              <TouchableOpacity 
                onPress={onAcknowledge}
                className="mt-4 flex-row items-center gap-2"
              >
                <CheckCircle size={14} color="#22d3ee" />
                <Text className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Acknowledge</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
