import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, RefreshControl } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Droplet, TrendingUp, TrendingDown, Download } from 'lucide-react-native';
import { chartConfig } from '../../constants/Theme';
import api, { unwrap } from '../../services/ApiService';
import useResponsive from '../../hooks/useResponsive';
import { ErrorState, SkeletonBlock, EmptyState } from '../../components/States';
import { safeChartSeries, safeInt } from '../../utils/safe';

export default function StatisticsScreen() {
  const { chart } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [weekly, setWeekly] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [savedLiters, setSavedLiters] = useState(0);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>({ this_week: 0, last_week: 0, percentage: 0 });

  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    setError(false);
    try {
      const [wRes, mRes, sRes, pRes, cRes] = await Promise.all([
        api.get('/api/stats/weekly'),
        api.get('/api/stats/monthly'),
        api.get('/api/stats/saved'),
        api.get('/api/stats/peak-hours'),
        api.get('/api/stats/comparison'),
      ]);

      const w = unwrap(wRes);
      const m = unwrap(mRes);
      const s = unwrap(sRes);
      const p = unwrap(pRes);
      const c = unwrap(cRes);

      setWeekly(Array.isArray(w?.data) ? w.data : []);
      setMonthly(Array.isArray(m?.data) ? m.data : []);
      setPeakHours(Array.isArray(p?.data) ? p.data : []);
      setSavedLiters(typeof s?.total_saved_liters === 'number' && !Number.isNaN(s.total_saved_liters) ? s.total_saved_liters : 0);
      setComparison({
        this_week: typeof c?.this_week === 'number' && !Number.isNaN(c.this_week) ? c.this_week : 0,
        last_week: typeof c?.last_week === 'number' && !Number.isNaN(c.last_week) ? c.last_week : 0,
        percentage: typeof c?.percentage === 'number' && !Number.isNaN(c.percentage) ? c.percentage : 0,
      });
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

  const weeklyLabels = useMemo(() => weekly.map((d) => String(d.day ?? '—')), [weekly]);
  const weeklyValues = useMemo(
    () => safeChartSeries(weekly.map((d) => d?.consumption), 2),
    [weekly]
  );

  const monthlyLabels = useMemo(() => {
    const labels = monthly
      .filter((_: any, i: number) => i % 5 === 0 || i === monthly.length - 1)
      .map((d: any) => String(d?.date ?? '—'));
    return labels.length > 0 ? labels : ['—'];
  }, [monthly]);

  const monthlyValues = useMemo(
    () => safeChartSeries(monthly.map((d) => d?.consumption), 2),
    [monthly]
  );

  const heatmapValues = useMemo(
    () => safeChartSeries(peakHours.map((h) => h?.avg_flow), 2),
    [peakHours]
  );

  const heatmapLabels = useMemo(() => {
    const labels = peakHours
      .filter((h: any) => (typeof h?.hour === 'number' ? h.hour % 4 === 0 : false))
      .map((h: any) => `${h.hour}h`);
    return labels.length > 0 ? labels : ['0h'];
  }, [peakHours]);

  const isPositive = comparison.percentage > 0;

  const handleExport = async () => {
    const lines = ['Date,Consommation (L)'];
    monthly.forEach((d: any) => lines.push(`${String(d?.date ?? '')},${Number(d?.consumption ?? 0)}`));
    const csv = lines.join('\n');
    try {
      await Share.share({
        message: csv,
        title: 'statistiques_eau.csv',
      });
    } catch (e) {
      console.error('Export error', e);
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
        <View className="p-4 space-y-6">
        <View className="mb-2">
          <Text className="text-3xl font-black text-white mb-1 tracking-tight">Statistiques</Text>
          <Text className="text-slate-500 text-sm">Analyse de consommation et tendances</Text>
        </View>

        {loading ? (
          <View className="space-y-6">
            <SkeletonBlock height={120} borderRadius={24} />
            <SkeletonBlock height={120} borderRadius={24} />
            <SkeletonBlock height={260} borderRadius={24} />
            <SkeletonBlock height={260} borderRadius={24} />
          </View>
        ) : weekly.length === 0 && monthly.length === 0 ? (
          <EmptyState />
        ) : (
          <>
        {/* Eau économisée */}
        <View
          className="rounded-3xl p-6 border shadow-2xl flex-row items-center gap-4"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <View className="p-4 bg-cyan-500/10 rounded-2xl">
            <Droplet size={32} color="#00BCD4" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Eau économisée (fuites évitées)
            </Text>
            <Text className="text-4xl font-black text-white tabular-nums">
              {safeInt(savedLiters, { fallback: '0' })}
            </Text>
            <Text className="text-slate-500 text-sm font-bold">Litres</Text>
          </View>
        </View>

        {/* Comparaison semaine */}
        <View
          className="rounded-3xl p-6 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <Text className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-4">
            Cette semaine vs semaine dernière
          </Text>
          <View className="flex-row items-center gap-4">
            {isPositive ? (
              <TrendingUp size={32} color="#FF3B5C" />
            ) : (
              <TrendingDown size={32} color="#22C55E" />
            )}
            <View>
              <Text
                className="text-3xl font-black tabular-nums"
                style={{ color: isPositive ? '#FF3B5C' : '#22C55E' }}
              >
                {isPositive ? '+' : ''}
                {Math.round(comparison.percentage)}%
              </Text>
              <Text className="text-slate-500 text-xs font-bold">
                {Math.round(comparison.this_week)} L cette semaine • {Math.round(comparison.last_week)} L la semaine dernière
              </Text>
            </View>
          </View>
        </View>

        {/* Graphique hebdomadaire */}
        <View
          className="rounded-3xl p-4 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <Text className="text-white font-black text-lg mb-1 px-2 tracking-tight">
            Consommation hebdomadaire
          </Text>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 px-2">
            7 derniers jours (Litres)
          </Text>
          <BarChart
            data={{
              labels: weeklyLabels,
              datasets: [{ data: weeklyValues }],
            }}
            width={chart.width - 16}
            height={chart.height}
            chartConfig={chartConfig}
            style={{ borderRadius: 16, marginLeft: -8 }}
            yAxisSuffix=" L"
            fromZero
            showValuesOnTopOfBars={false}
          />
        </View>

        {/* Graphique mensuel */}
        <View
          className="rounded-3xl p-4 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <Text className="text-white font-black text-lg mb-1 px-2 tracking-tight">
            Tendance mensuelle
          </Text>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 px-2">
            30 derniers jours (Litres)
          </Text>
          <LineChart
            data={{
              labels: monthlyLabels.length > 0 ? monthlyLabels : ['—'],
              datasets: [{ data: monthlyValues, strokeWidth: 2 }],
            }}
            width={chart.width - 16}
            height={chart.height}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16, marginLeft: -8 }}
            withInnerLines
            fromZero
          />
        </View>

        {/* Heatmap heures de pointe */}
        <View
          className="rounded-3xl p-4 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          <Text className="text-white font-black text-lg mb-1 px-2 tracking-tight">
            Heures de pointe
          </Text>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 px-2">
            Intensité d'utilisation sur 24h
          </Text>
          <BarChart
            data={{
              labels: heatmapLabels.length > 0 ? heatmapLabels : ['0h'],
              datasets: [{ data: heatmapValues }],
            }}
            width={chart.width - 16}
            height={160}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
              barPercentage: 0.6,
            }}
            style={{ borderRadius: 16, marginLeft: -8 }}
            fromZero
            showValuesOnTopOfBars={false}
            yAxisSuffix=""
          />
          <Text className="text-slate-600 text-[9px] font-bold mt-2 px-2 uppercase tracking-widest">
            0h → 23h (intensité par heure)
          </Text>
        </View>

        {/* Export CSV */}
        <TouchableOpacity
          onPress={handleExport}
          className="rounded-2xl py-5 flex-row items-center justify-center gap-3 border border-cyan-800"
          style={{ backgroundColor: '#131929' }}
          activeOpacity={0.8}
        >
          <Download size={20} color="#00BCD4" />
          <Text className="text-cyan-400 font-black text-sm tracking-widest uppercase">
            Exporter en CSV
          </Text>
        </TouchableOpacity>
          </>
        )}
      </View>
      )}
    </ScrollView>
  );
}
