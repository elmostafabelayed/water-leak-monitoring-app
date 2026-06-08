import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { BellRing, ShieldAlert, Activity, CheckCircle, Clock } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api, { unwrap } from '../../services/ApiService';
import { ErrorState, SkeletonBlock, EmptyState } from '../../components/States';
import { safeDateTime, safeString } from '../../utils/safe';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'SYSTEM'>('ALL');

  const fetchAlerts = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    setError(false);
    try {
      const res = await api.get('/api/alerts');
      const data = unwrap(res);
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setAlerts(list);
    } catch {
      setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts({ silent: true });
    setRefreshing(false);
  }, [fetchAlerts]);

  const acknowledgeAlert = useCallback(async (id: string) => {
    try {
      await api.post(`/api/alerts/${id}/acknowledge`);
      setAlerts((prev) => prev.map((a) => (String(a.id) === String(id) ? { ...a, acknowledged: true } : a)));
    } catch {
      // ignore
    }
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const severity = String(a?.severity ?? '').toUpperCase();
      const type = String(a?.type ?? '').toUpperCase();
      if (filter === 'CRITICAL') return severity === 'CRITICAL' || severity === 'HIGH';
      if (filter === 'SYSTEM') return type === 'SYSTEM' || type === 'ACTION';
      return true;
    });
  }, [alerts, filter]);

  if (error) return <ErrorState onRetry={() => fetchAlerts()} />;

  return (
    <FlatList
      className="flex-1 bg-slate-950"
      contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
      refreshControl={<RefreshControl tintColor="#00BCD4" refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View className="pt-4">
          <View className="mb-6">
            <Text className="text-3xl font-black text-white mb-4 tracking-tight">Journal d'événements</Text>
            <View className="flex-row gap-2">
              <FilterPill label="Tous" active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
              <FilterPill label="Critiques" active={filter === 'CRITICAL'} onPress={() => setFilter('CRITICAL')} />
              <FilterPill label="Système" active={filter === 'SYSTEM'} onPress={() => setFilter('SYSTEM')} />
            </View>
          </View>
          {loading && (
            <View className="space-y-4">
              <SkeletonBlock height={120} borderRadius={24} />
              <SkeletonBlock height={120} borderRadius={24} />
              <SkeletonBlock height={120} borderRadius={24} />
            </View>
          )}
          {!loading && filteredAlerts.length === 0 && <EmptyState text="Aucune donnée disponible" />}
          {!loading && filteredAlerts.length > 0 && (
            <View className="border-l-2 border-slate-800 ml-4 pl-6 space-y-6" />
          )}
        </View>
      }
      data={loading ? [] : filteredAlerts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <View className="border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          <AlertCard alert={item} onAcknowledge={() => acknowledgeAlert(String(item.id))} isLatest={index === 0} />
        </View>
      )}
      ListFooterComponent={
        !loading ? (
          <View className="mt-12 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-8 items-center">
            <Clock size={32} color="#475569" className="mb-3 opacity-50" />
            <Text className="text-[10px] text-slate-500 text-center font-black uppercase tracking-widest leading-4">
              Affichage des données des 30 derniers jours. Les journaux plus anciens sont archivés.
            </Text>
          </View>
        ) : null
      }
    />
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

function AlertCard({ alert, onAcknowledge }: { alert: any; onAcknowledge: () => void; isLatest: boolean }) {
  const styles = {
    CRITICAL: { bg: 'bg-rose-950/20', border: 'border-rose-900/50', line: 'bg-rose-500', color: '#fb7185', icon: ShieldAlert },
    HIGH: { bg: 'bg-orange-950/20', border: 'border-orange-900/50', line: 'bg-orange-500', color: '#fb923c', icon: BellRing },
    MEDIUM: { bg: 'bg-yellow-950/20', border: 'border-yellow-900/50', line: 'bg-yellow-500', color: '#facc15', icon: Activity },
    LOW: { bg: 'bg-slate-900', border: 'border-slate-800', line: 'bg-cyan-500', color: '#22d3ee', icon: CheckCircle },
  }[String(alert?.severity ?? 'LOW').toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'] || {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    line: 'bg-cyan-500',
    color: '#22d3ee',
    icon: CheckCircle,
  };

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
            <Text className="font-black text-white text-base mb-1 tracking-tight">
              {safeString(alert?.type)}
            </Text>
            <Text className="text-slate-400 text-sm mb-4 leading-5">
              {safeString(alert?.message, '')}
            </Text>
            
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Clock size={12} color="#64748b" />
                <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {safeDateTime(alert?.created_at)}
                </Text>
              </View>
              
              <View className={cn("px-2 py-0.5 rounded-sm border", styles.border)}>
                <Text className="font-black uppercase text-[8px] tracking-[2px]" style={{ color: styles.color }}>
                  {String(alert?.severity ?? 'LOW')}
                </Text>
              </View>
            </View>

            {!alert.acknowledged && (
              <TouchableOpacity 
                onPress={onAcknowledge}
                className="mt-4 flex-row items-center gap-2"
              >
                <CheckCircle size={14} color="#22d3ee" />
                <Text className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Acquitter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
