import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, RefreshControl } from 'react-native';
import { ShieldCheck, ArrowDownToLine, Wifi, ChevronDown, Radio } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api, { unwrap } from '../../services/ApiService';
import { ErrorState, SkeletonBlock, EmptyState } from '../../components/States';
import { safeNumber, safeString } from '../../utils/safe';
import useResponsive from '../../hooks/useResponsive';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MonitoringScreen() {
  const { isTablet, spacing } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sensors, setSensors] = useState<any[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [sensorData, setSensorData] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const selectedSensor = useMemo(
    () => sensors.find((s) => String(s.id) === String(selectedSensorId)) || sensors[0],
    [sensors, selectedSensorId]
  );

  const fetchSensors = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    setError(false);
    try {
      const res = await api.get('/api/sensors');
      const data = unwrap(res);
      const list = Array.isArray(data) ? data : [];
      setSensors(list);
      const nextSelected = selectedSensorId || (list[0] ? String(list[0].id) : '');
      setSelectedSensorId(nextSelected);
    } catch {
      setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedSensorId]);

  const fetchSensorData = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await api.get(`/api/sensors/${id}/data`);
      const data = unwrap(res);
      setSensorData(data);
    } catch {
      setSensorData(null);
    }
  }, []);

  const fetchDeviceInfo = useCallback(async () => {
    try {
      const res = await api.get('/api/device/info');
      const data = unwrap(res);
      setDeviceInfo(data);
    } catch {
      setDeviceInfo(null);
    }
  }, []);

  useEffect(() => {
    fetchSensors().then(fetchDeviceInfo);
  }, [fetchSensors, fetchDeviceInfo]);

  useEffect(() => {
    if (selectedSensorId) fetchSensorData(selectedSensorId);
  }, [selectedSensorId, fetchSensorData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchSensors({ silent: true }), fetchDeviceInfo()]);
    if (selectedSensorId) await fetchSensorData(selectedSensorId);
    setRefreshing(false);
  }, [fetchSensors, fetchDeviceInfo, selectedSensorId, fetchSensorData]);

  const pressureValue =
    typeof sensorData?.pressure === 'number' && !Number.isNaN(sensorData.pressure) ? sensorData.pressure : 0;
  const safePressure = useMemo(() => safeNumber(sensorData?.pressure), [sensorData?.pressure]);
  const safeUptime = useMemo(() => safeString(sensorData?.uptime), [sensorData?.uptime]);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: '#0A0E1A' }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl tintColor="#00BCD4" refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error ? (
        <ErrorState onRetry={() => fetchSensors()} />
      ) : (
        <View className="p-4 space-y-6" style={isTablet ? { padding: spacing.padding } : undefined}>
        <View className="mb-4 px-2">
          <Text className="text-3xl font-black text-white mb-1 tracking-tight">Surveillance</Text>
          <Text className="text-slate-500 text-sm mb-4">Système actif et en analyse</Text>

          <View className="flex-row items-center gap-2 self-start px-4 py-2 rounded-full border border-slate-800"
            style={{ backgroundColor: '#131929' }}
          >
            <View className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <Text className="text-[10px] font-black text-slate-300 tracking-widest uppercase">
              ESP32 CONNECTÉ
            </Text>
          </View>
        </View>

        {/* Sélecteur de capteur */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          {loading ? (
            <SkeletonBlock height={140} borderRadius={24} />
          ) : sensors.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <Text className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-4">
                Capteur actif
              </Text>
              <TouchableOpacity
                onPress={() => setDropdownVisible(true)}
                className="flex-row items-center justify-between bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Radio size={18} color="#00BCD4" />
                  <Text className="text-white font-bold text-sm flex-1" numberOfLines={1}>
                    {safeString(selectedSensor?.name)}
                  </Text>
                </View>
                <ChevronDown size={18} color="#64748B" />
              </TouchableOpacity>

              {selectedSensor && (
                <View className="mt-4 space-y-3">
                  <SensorInfoRow
                    label="Statut"
                    value={safeString(selectedSensor?.status)}
                    valueColor={String(selectedSensor?.status).toLowerCase() === 'online' ? '#22C55E' : '#FF3B5C'}
                  />
                  <SensorInfoRow
                    label="Dernière lecture"
                    value={`${safeNumber(selectedSensor?.last_reading)} L/min`}
                  />
                  <SensorInfoRow label="Emplacement" value={safeString(selectedSensor?.location)} last />
                </View>
              )}
            </>
          )}
        </View>

        {/* Pression */}
        <View
          className="rounded-3xl p-6 border shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <ArrowDownToLine size={24} color="#00BCD4" />
            <View className="bg-cyan-950 px-3 py-1 rounded-sm border border-cyan-800">
              <Text className="text-cyan-400 text-[10px] font-black tracking-widest uppercase">
                OPTIMAL
              </Text>
            </View>
          </View>

          <View className="flex-row items-baseline gap-2 mb-2">
            <Text className="text-5xl font-black text-white tabular-nums tracking-tighter">
              {safePressure}
            </Text>
            <Text className="text-lg text-slate-500 font-bold uppercase">PSI</Text>
          </View>
          <Text className="text-slate-500 text-xs font-black tracking-widest uppercase">
            Pression de l'eau
          </Text>

          <View className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <View
              className="h-full"
              style={{
                width: `${Math.min(100, ((pressureValue - 40) / 40) * 100)}%`,
                backgroundColor: '#00BCD4',
              }}
            />
          </View>
        </View>

        {/* État du système */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <View className="flex-row items-center gap-4 mb-4">
            <View className="p-3 bg-cyan-500/10 rounded-2xl">
              <ShieldCheck size={32} color="#00BCD4" />
            </View>
            <View>
              <Text className="text-3xl font-black text-white">Sain</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <Text className="text-slate-500 text-xs font-bold uppercase">
                  État des conduites : Sécurisé
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Liste des capteurs */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <Text className="text-white font-black text-lg mb-4 tracking-tight">
            Tous les capteurs ({sensors.length})
          </Text>
          {sensors.length === 0 ? (
            <EmptyState />
          ) : (
            sensors.map((sensor, i) => (
            <TouchableOpacity
              key={String(sensor.id)}
              onPress={() => setSelectedSensorId(String(sensor.id))}
              className={cn(
                'flex-row items-center justify-between py-3',
                i < sensors.length - 1 && 'border-b border-slate-800'
              )}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className={cn(
                    'w-2 h-2 rounded-full',
                    String(sensor.status).toLowerCase() === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                />
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">{safeString(sensor.name)}</Text>
                  <Text className="text-slate-500 text-[10px]">{safeString(sensor.location)}</Text>
                </View>
              </View>
              <Text className="text-cyan-400 font-black text-xs tabular-nums">
                {safeNumber(sensor.last_reading)} L/min
              </Text>
            </TouchableOpacity>
          ))
          )}
        </View>

        {/* Diagnostics */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <Text className="text-white font-black text-lg mb-6 tracking-tight">
            Diagnostics techniques
          </Text>
          <View className="space-y-4">
            <DiagRow label="Identifiant nœud" value={safeString(deviceInfo?.node_id)} />
            <DiagRow
              label="Durée de fonctionnement"
              value={safeString(deviceInfo?.uptime)}
            />
            <DiagRow label="Signal" value={`${safeNumber(deviceInfo?.signal, { decimals: 0 })} dBm`} />
            <DiagRow label="Firmware" value={safeString(deviceInfo?.firmware)} last />
          </View>
        </View>
        </View>
      )}

      <Modal transparent visible={dropdownVisible} animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View
            className="rounded-t-3xl p-6 max-h-96"
            style={{ backgroundColor: '#131929' }}
          >
            <Text className="text-white font-black text-lg mb-4">Sélectionner un capteur</Text>
            <FlatList
              data={sensors}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSensorId(String(item.id));
                    setDropdownVisible(false);
                  }}
                  className={cn(
                    'py-4 border-b border-slate-800 flex-row items-center gap-3',
                    String(item.id) === String(selectedSensorId) && 'bg-cyan-500/10'
                  )}
                >
                  <Wifi size={16} color={String(item.status).toLowerCase() === 'online' ? '#22C55E' : '#FF3B5C'} />
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm">{safeString(item.name)}</Text>
                    <Text className="text-slate-500 text-xs">{safeString(item.location)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

function SensorInfoRow({
  label,
  value,
  valueColor,
  last,
}: {
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <View className={cn('flex-row justify-between py-2', !last && 'border-b border-slate-800')}>
      <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
        {label}
      </Text>
      <Text
        className="font-black text-xs uppercase"
        style={{ color: valueColor || '#fff' }}
      >
        {value}
      </Text>
    </View>
  );
}

function DiagRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      className={cn(
        'flex-row justify-between items-center py-3 border-slate-800',
        !last && 'border-b'
      )}
    >
      <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
        {label}
      </Text>
      <Text className="text-white font-black text-xs uppercase">{value}</Text>
    </View>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}j ${hours}h ${mins}m`;
}
