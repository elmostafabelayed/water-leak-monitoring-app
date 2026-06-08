import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert as NativeAlert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  Wifi,
  Battery,
  RotateCcw,
  Settings2,
  BellRing,
  Mail,
  LogOut,
  ShieldCheck,
} from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api, { unwrap } from '../../services/ApiService';
import { ErrorState, SkeletonBlock } from '../../components/States';
import { safeNumber, safeString } from '../../utils/safe';
import useResponsive from '../../hooks/useResponsive';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const { isTablet, spacing } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const autoMode = useMemo(() => String(settings?.valve_mode ?? 'auto') === 'auto', [settings?.valve_mode]);
  const pushNotifs = useMemo(() => !!settings?.push_notifications, [settings?.push_notifications]);
  const emailNotifs = useMemo(() => !!settings?.email_alerts, [settings?.email_alerts]);

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    setError(false);
    try {
      const [sRes, dRes] = await Promise.all([api.get('/api/settings'), api.get('/api/device/info')]);
      setSettings(unwrap(sRes));
      setDeviceInfo(unwrap(dRes));
    } catch {
      setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll({ silent: true });
    setRefreshing(false);
  }, [fetchAll]);

  const updateSettings = useCallback(
    async (partial: Record<string, any>) => {
      if (!settings) return;
      setUpdating(true);
      try {
        const res = await api.post('/api/settings', { ...settings, ...partial });
        setSettings(unwrap(res));
      } catch {
        // ignore
      } finally {
        setUpdating(false);
      }
    },
    [settings]
  );

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (e) {
        console.error('Logout error', e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vraiment vous déconnecter du réseau de surveillance ?')) {
        await performLogout();
      }
    } else {
      NativeAlert.alert(
        'Fin de session',
        'Voulez-vous vraiment vous déconnecter du réseau de surveillance ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnecter', style: 'destructive', onPress: performLogout },
        ]
      );
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: '#0A0E1A' }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl tintColor="#00BCD4" refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error ? (
        <ErrorState onRetry={() => fetchAll()} />
      ) : (
        <View className="p-4 space-y-6" style={isTablet ? { padding: spacing.padding } : undefined}>
        <View className="mb-4">
          <Text className="text-3xl font-black text-white mb-1 tracking-tight">Paramètres</Text>
          <Text className="text-slate-500 text-sm">Configurez votre système de surveillance.</Text>
        </View>

        {loading ? (
          <View className="space-y-6">
            <SkeletonBlock height={160} borderRadius={24} />
            <SkeletonBlock height={160} borderRadius={24} />
            <SkeletonBlock height={160} borderRadius={24} />
          </View>
        ) : (
          <>

        {/* Connectivité */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-2">
              <Text className="text-cyan-400 font-black text-[10px] tracking-widest uppercase">
                CONNECTIVITÉ
              </Text>
              <View className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </View>
            <Text className="text-slate-400 font-bold text-xs uppercase">ESP32 en ligne</Text>
          </View>

          <View className="space-y-3">
            <View className="bg-slate-950 p-4 rounded-2xl flex-row justify-between items-center border border-slate-800">
              <View className="flex-row items-center gap-3">
                <Wifi size={18} color="#64748b" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest">
                  Force du signal
                </Text>
              </View>
              <Text className="text-cyan-400 font-black tabular-nums">
                {safeNumber(deviceInfo?.signal, { decimals: 0 })} dBm
              </Text>
            </View>

            <View className="bg-slate-950 p-4 rounded-2xl flex-row justify-between items-center border border-slate-800">
              <View className="flex-row items-center gap-3">
                <Settings2 size={18} color="#64748b" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest">SSID</Text>
              </View>
              <Text className="text-slate-500 font-black text-[10px]">{safeString(deviceInfo?.ssid)}</Text>
            </View>
          </View>
        </View>

        {/* Santé système */}
        <View className="flex-row gap-4">
          <View
            className="flex-1 rounded-3xl p-6 border shadow-2xl items-center"
            style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
          >
            <Battery size={24} color="#00BCD4" />
            <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 mt-3">
              Batterie
            </Text>
            <Text className="text-3xl font-black text-white tabular-nums">
              {safeNumber(deviceInfo?.battery, { decimals: 0, fallback: '0' })}%
            </Text>
          </View>

          <View
            className="flex-1 rounded-3xl p-6 border shadow-2xl items-center"
            style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
          >
            <RotateCcw size={24} color="#00BCD4" />
            <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 mt-3">
              Firmware
            </Text>
            <Text className="text-xl font-black text-white tabular-nums">{safeString(deviceInfo?.firmware)}</Text>
          </View>
        </View>

        {/* Mode vanne */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <View className="flex-row items-center gap-3 mb-6">
            <View className="p-2 bg-slate-950 rounded-xl border border-slate-800">
              <Settings2 size={20} color="#00BCD4" />
            </View>
            <View>
              <Text className="text-white font-black text-base tracking-tight">
                Contrôle de vanne
              </Text>
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Protocole d'arrêt
              </Text>
            </View>
          </View>

          <View className="bg-slate-950 flex-row rounded-2xl p-1 border border-slate-800 h-14">
            <TouchableOpacity
              onPress={() => updateSettings({ valve_mode: 'auto' })}
              disabled={updating}
              className={cn(
                'flex-1 items-center justify-center rounded-xl',
                autoMode ? 'bg-cyan-500' : 'bg-transparent'
              )}
            >
              <Text
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  autoMode ? 'text-slate-950' : 'text-slate-500'
                )}
              >
                Automatique
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateSettings({ valve_mode: 'manual' })}
              disabled={updating}
              className={cn(
                'flex-1 items-center justify-center rounded-xl',
                !autoMode ? 'bg-cyan-500' : 'bg-transparent'
              )}
            >
              <Text
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  !autoMode ? 'text-slate-950' : 'text-slate-500'
                )}
              >
                Manuel
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-slate-600 text-[10px] mt-4 italic text-center font-bold">
            Le mode « Automatique » ferme la vanne instantanément en cas de fuite.
          </Text>
        </View>

        {/* Préférences alertes */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <Text className="text-slate-500 font-black text-[10px] tracking-widest uppercase mb-6">
            Préférences d'alertes
          </Text>

          <ToggleRow
            icon={<BellRing size={20} color="#64748b" />}
            title="Notifications push"
            desc="Alertes mobiles en temps réel"
            value={pushNotifs}
          onValueChange={(v) => updateSettings({ push_notifications: v })}
          />
          <ToggleRow
            icon={<Mail size={20} color="#64748b" />}
            title="Alertes e-mail"
            desc="Rapports hebdomadaires"
            value={emailNotifs}
          onValueChange={(v) => updateSettings({ email_alerts: v })}
            last
          />
        </View>

        {/* Session */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <View className="flex-row items-center gap-3 mb-6">
            <View className="p-2 bg-slate-950 rounded-xl border border-slate-800">
              <ShieldCheck size={20} color="#00BCD4" />
            </View>
            <View>
              <Text className="text-white font-black text-base tracking-tight">Session active</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  {user?.email || 'N/A'} • {user?.name || 'Inconnu'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="w-full h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center justify-center gap-3 active:bg-red-500/20"
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="text-red-500 font-black text-xs uppercase tracking-widest">
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>
          </>
        )}
        </View>
      )}
    </ScrollView>
  );
}

function ToggleRow({
  icon,
  title,
  desc,
  value,
  onValueChange,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View
      className={cn(
        'flex-row justify-between items-center py-4 border-slate-800',
        !last && 'border-b'
      )}
    >
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
        trackColor={{ false: '#334155', true: '#00BCD4' }}
        thumbColor={value ? '#f8fafc' : '#94a3b8'}
      />
    </View>
  );
}
