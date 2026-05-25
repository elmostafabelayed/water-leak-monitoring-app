import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert as NativeAlert, Platform } from 'react-native';
import { useWaterSystem } from '../../context/WaterContext';
import { useAuth } from '../../context/AuthContext';
import { Wifi, Battery, RotateCcw, Settings2, BellRing, Mail, LogOut, ShieldCheck } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsScreen() {
  const { data } = useWaterSystem();
  const { logout, user } = useAuth();
  const [autoMode, setAutoMode] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (e) {
        console.error("Logout error", e);
      }
    };

    if (Platform.OS === 'web') {
      const confirmLogOut = window.confirm("Are you sure you want to disconnect from the monitoring network?");
      if (confirmLogOut) {
        await performLogout();
      }
    } else {
      NativeAlert.alert(
        "End Session",
        "Are you sure you want to disconnect from the monitoring network?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Disconnect", style: "destructive", onPress: performLogout }
        ]
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-4 space-y-6">
        
        {/* Header */}
        <View className="mb-4">
          <Text className="text-3xl font-black text-white mb-1 tracking-tight">Configuration</Text>
          <Text className="text-slate-500 text-sm">Fine-tune your sentinel's parameters.</Text>
        </View>

        {/* Connectivity Card */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-2">
              <Text className="text-cyan-400 font-black text-[10px] tracking-widest uppercase">CONNECTIVITY</Text>
              <View className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </View>
            <Text className="text-slate-400 font-bold text-xs uppercase">ESP32 Online</Text>
          </View>

          <View className="space-y-3">
            <View className="bg-slate-950 p-4 rounded-2xl flex-row justify-between items-center border border-slate-800">
              <View className="flex-row items-center gap-3">
                <Wifi size={18} color="#64748b" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest">Signal Strength</Text>
              </View>
              <Text className="text-cyan-400 font-black tabular-nums">{data.signalStrength} dBm</Text>
            </View>

            <View className="bg-slate-950 p-4 rounded-2xl flex-row justify-between items-center border border-slate-800">
              <View className="flex-row items-center gap-3">
                <Settings2 size={18} color="#64748b" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest">SSID</Text>
              </View>
              <Text className="text-slate-500 font-black text-[10px]">INDUSTRIAL_GRID_A4</Text>
            </View>
          </View>
        </View>

        {/* System Health Stats */}
        <View className="flex-row gap-4">
          <View className="flex-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl items-center">
            <Battery size={24} color="#22d3ee" className="mb-3" />
            <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Battery</Text>
            <Text className="text-3xl font-black text-white tabular-nums">{data.battery}%</Text>
          </View>

          <View className="flex-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl items-center">
            <RotateCcw size={24} color="#22d3ee" className="mb-3" />
            <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Firmware</Text>
            <Text className="text-xl font-black text-white tabular-nums">v2.4.1</Text>
          </View>
        </View>

        {/* Valve Mode Toggle */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="p-2 bg-slate-950 rounded-xl border border-slate-800">
              <Settings2 size={20} color="#22d3ee" />
            </View>
            <View>
              <Text className="text-white font-black text-base tracking-tight">Valve Control</Text>
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Shutdown Protocol</Text>
            </View>
          </View>

          <View className="bg-slate-950 flex-row rounded-2xl p-1 border border-slate-800 h-14">
            <TouchableOpacity 
              onPress={() => setAutoMode(true)}
              className={cn(
                "flex-1 items-center justify-center rounded-xl",
                autoMode ? "bg-cyan-500" : "bg-transparent"
              )}
            >
              <Text className={cn("text-[10px] font-black uppercase tracking-widest", autoMode ? "text-slate-950" : "text-slate-500")}>
                Automatic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setAutoMode(false)}
              className={cn(
                "flex-1 items-center justify-center rounded-xl",
                !autoMode ? "bg-cyan-500" : "bg-transparent"
              )}
            >
              <Text className={cn("text-[10px] font-black uppercase tracking-widest", !autoMode ? "text-slate-950" : "text-slate-500")}>
                Manual
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-slate-600 text-[10px] mt-4 italic text-center font-bold">
            "Automatic" closes valve instantly on leak detection.
          </Text>
        </View>

        {/* Preferences */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
           <Text className="text-slate-500 font-black text-[10px] tracking-widest uppercase mb-6">Alert Preferences</Text>
           
           <View className="space-y-4">
             <ToggleRow 
               icon={<BellRing size={20} color="#64748b" />}
               title="Push Notifications"
               desc="Real-time mobile alerts"
               value={pushNotifs}
               onValueChange={setPushNotifs}
             />
             <ToggleRow 
               icon={<Mail size={20} color="#64748b" />}
               title="Email Alerts"
               desc="Weekly reports"
               value={emailNotifs}
               onValueChange={setEmailNotifs}
               last
             />
           </View>
        </View>

        {/* Session Management */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
           <View className="flex-row items-center gap-3 mb-6">
             <View className="p-2 bg-slate-950 rounded-xl border border-slate-800">
               <ShieldCheck size={20} color="#22d3ee" />
             </View>
              <View>
                <Text className="text-white font-black text-base tracking-tight">Active Session</Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    ID: {user?.email || 'N/A'} • {user?.name || 'Unknown'}
                  </Text>
                </View>
              </View>
           </View>

           <TouchableOpacity 
             onPress={handleLogout}
             className="w-full h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center justify-center gap-3 active:bg-red-500/20"
           >
             <LogOut size={18} color="#ef4444" />
             <Text className="text-red-500 font-black text-xs uppercase tracking-widest">Terminate Connection</Text>
           </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

function ToggleRow({ icon, title, desc, value, onValueChange, last }: { icon: any, title: string, desc: string, value: boolean, onValueChange: (v: boolean) => void, last?: boolean }) {
  return (
    <View className={cn(
      "flex-row justify-between items-center py-4 border-slate-800",
      !last && "border-b"
    )}>
      <View className="flex-row items-center gap-4">
        {icon}
        <View>
          <Text className="text-white font-black text-sm tracking-tight">{title}</Text>
          <Text className="text-slate-500 text-xs font-medium">{desc}</Text>
        </View>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#334155', true: '#06b6d4' }}
        thumbColor={value ? '#f8fafc' : '#94a3b8'}
      />
    </View>
  );
}
