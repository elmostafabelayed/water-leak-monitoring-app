import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Droplet, Activity } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FlowLineChart from '../../components/FlowLineChart';
import ValveConfirmModal from '../../components/ValveConfirmModal';
import Toast from '../../components/Toast';
import api, { unwrap } from '../../services/ApiService';
import useResponsive from '../../hooks/useResponsive';
import { ErrorState, SkeletonBlock } from '../../components/States';
import dayjs from 'dayjs';
import { safeInt, safeNumber } from '../../utils/safe';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardScreen() {
  const { chart, isTablet } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [latest, setLatest] = useState<any>(null);
  const [flowHistory, setFlowHistory] = useState<any[]>([]);
  const [valveLoading, setValveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearToast = useCallback(() => setToastMessage(null), []);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<'OPEN' | 'CLOSE'>('CLOSE');

  const handleValvePress = useCallback(() => {
    const valveStatus = String(latest?.valve_status ?? '').toLowerCase();
    const isOpen = valveStatus === 'open' || valveStatus === 'opened' || valveStatus === '1' || valveStatus === 'true';
    setPendingAction(isOpen ? 'CLOSE' : 'OPEN');
    setConfirmVisible(true);
  }, [latest]);

  const fetchDashboard = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = !!opts?.silent;
      if (!silent) setLoading(true);
      setError(false);
      try {
        const [latestRes, historyRes] = await Promise.all([
          api.get('/api/sensor/latest'),
          api.get('/api/flow/history'),
        ]);

        const latestData = unwrap(latestRes);
        const historyData = unwrap(historyRes);
        const history = Array.isArray(historyData?.data) ? historyData.data : [];

        setLatest(latestData);
        setFlowHistory(
          history.map((p: any) => {
            const t = p?.time;
            const label = (() => {
              try {
                const d = dayjs(t);
                return d.isValid() ? d.format('HH:mm') : '—';
              } catch {
                return '—';
              }
            })();
            const flow = typeof p?.flow_rate === 'number' && !Number.isNaN(p.flow_rate) ? p.flow_rate : 0;
            return { time: String(t ?? ''), label, flow, isAnomaly: flow > 20 };
          })
        );
      } catch {
        setError(true);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboard();
    pollRef.current = setInterval(() => fetchDashboard({ silent: true }), 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchDashboard]);

  const handleConfirm = useCallback(async () => {
    setValveLoading(true);
    try {
      const action = pendingAction === 'OPEN' ? 'open' : 'close';
      await api.post('/api/valve/control', { action });
      setToastMessage(action === 'open' ? 'Vanne ouverte avec succès' : 'Vanne fermée avec succès');
      await fetchDashboard({ silent: true });
      setConfirmVisible(false);
    } catch {
      setToastMessage('Impossible de contrôler la vanne');
    } finally {
      setValveLoading(false);
    }
  }, [pendingAction, fetchDashboard]);

  const flowRateNumber =
    typeof latest?.flow_rate === 'number' && !Number.isNaN(latest.flow_rate) ? latest.flow_rate : 0;
  const isNormal = flowRateNumber < 15;

  const dailyUsageNumber =
    typeof latest?.daily_usage === 'number' && !Number.isNaN(latest.daily_usage) ? latest.daily_usage : 0;
  const dailyLimit = 650;
  const dailyPercent = Math.min(100, Math.round((dailyUsageNumber / dailyLimit) * 100));

  const valveStatus = String(latest?.valve_status ?? '').toLowerCase();
  const valveOpen = valveStatus === 'open' || valveStatus === 'opened' || valveStatus === '1' || valveStatus === 'true';

  const safeFlow = useMemo(() => safeNumber(latest?.flow_rate), [latest?.flow_rate]);
  const safeDaily = useMemo(() => safeInt(latest?.daily_usage, { fallback: '0' }), [latest?.daily_usage]);

  return (
    <View className="flex-1" style={{ backgroundColor: '#0A0E1A' }}>
      <Toast message={toastMessage} onHide={clearToast} />

      {error ? (
        <ErrorState onRetry={() => fetchDashboard()} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="p-4 space-y-6">
            {loading ? (
              <View className="space-y-6">
                <SkeletonBlock height={260} borderRadius={24} />
                <SkeletonBlock height={320} borderRadius={24} />
                <SkeletonBlock height={160} borderRadius={24} />
              </View>
            ) : (
              <>

          {/* Débit en temps réel */}
          <View
            className="rounded-3xl p-6 border shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-slate-400 font-bold tracking-widest text-xs uppercase">
                Débit en direct
              </Text>
              <View
                className={cn(
                  'flex-row items-center gap-1 px-2 py-1 rounded-full border',
                  isNormal
                    ? 'bg-cyan-950 border-cyan-800'
                    : 'bg-red-950 border-red-800'
                )}
              >
                <View
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isNormal ? 'bg-cyan-400' : 'bg-red-500'
                  )}
                />
                <Text
                  className={cn(
                    'text-[10px] font-black',
                    isNormal ? 'text-cyan-400' : 'text-red-400'
                  )}
                >
                  {isNormal ? 'NORMAL' : 'ANOMALIE'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-baseline gap-2 my-4">
              <Text
                className="text-6xl font-black tracking-tighter tabular-nums"
                style={{ color: isNormal ? '#00BCD4' : '#FF3B5C' }}
              >
                {safeFlow}
              </Text>
              <Text className="text-xl text-slate-500 font-medium">L/min</Text>
            </View>

            <Text className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-3">
              Historique — 60 dernières minutes
            </Text>
            <FlowLineChart data={flowHistory} height={chart.height} />
          </View>

          {/* Contrôle vanne */}
          <View
            className="rounded-3xl p-8 border items-center shadow-2xl"
            style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
          >
            <Text className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-6">
              Vanne principale
            </Text>

            <View className="flex-row items-center gap-3 mb-6">
              <View
                className={cn(
                  'w-3 h-3 rounded-full',
                  valveOpen ? 'bg-emerald-500' : 'bg-red-500'
                )}
              />
              <Text className="text-sm font-black text-slate-400 uppercase tracking-widest">
                {valveOpen ? 'Statut : Ouverte' : 'Statut : Fermée'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleValvePress}
              disabled={valveLoading}
              className={cn(
                'w-36 h-36 rounded-full border-4 items-center justify-center mb-8',
                valveOpen
                  ? 'border-emerald-500/50 bg-emerald-950/30'
                  : 'border-red-500/50 bg-red-950/30'
              )}
            >
              <Droplet
                size={48}
                color={valveOpen ? '#22C55E' : '#FF3B5C'}
                strokeWidth={2.5}
              />
            </TouchableOpacity>

            <View className="items-center mb-8" style={isTablet ? { maxWidth: 400, width: '100%' } : undefined}>
              <Text className="text-3xl font-black text-white mb-1">
                {valveOpen ? 'OUVERTE' : 'FERMÉE'}
              </Text>
              <Text className="text-slate-500 text-sm italic">
                {valveOpen
                  ? 'Opérationnelle • Aucune fuite'
                  : 'Alimentation sécurisée manuellement.'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleValvePress}
              disabled={valveLoading}
              className={cn(
                'w-full py-5 rounded-2xl flex-row justify-center items-center gap-3',
                valveOpen ? 'bg-red-500' : 'bg-emerald-500',
                valveLoading && 'opacity-60'
              )}
              style={isTablet ? { maxWidth: 400 } : undefined}
            >
              <Text className="font-black text-sm tracking-widest text-white">
                {valveLoading
                  ? 'EN COURS...'
                  : valveOpen
                  ? 'FERMER LA VANNE'
                  : 'OUVRIR LA VANNE'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Consommation journalière */}
          <View
            className="rounded-3xl p-6 border shadow-2xl"
            style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <Activity size={20} color="#94a3b8" />
              <Text className="text-white font-bold text-lg">Consommation du jour</Text>
            </View>

            <View className="flex-row items-baseline gap-2 mb-4">
              <Text className="text-4xl font-black text-white tabular-nums">
                {safeDaily}
              </Text>
              <Text className="text-slate-500 font-medium text-lg">Litres</Text>
            </View>

            <View className="w-full bg-slate-800 rounded-full h-3 mb-3 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${dailyPercent}%`, backgroundColor: '#00BCD4' }}
              />
            </View>
            <Text className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              {dailyPercent}% de la limite journalière
            </Text>
          </View>
              </>
            )}
          </View>
        </ScrollView>
      )}

      <ValveConfirmModal
        visible={confirmVisible}
        action={pendingAction}
        loading={valveLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}
