import { useWaterSystem } from '../context/WaterContext';
import { ShieldCheck, ArrowDownToLine, Wifi } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, YAxis } from 'recharts';
import { useState, useEffect } from 'react';

const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  flow: 10 + Math.random() * 5 + (i > 20 ? Math.random() * 10 : 0) // Simule une montée récente
}));

export function StatsScreen() {
  const { data } = useWaterSystem();
  
  // Simuler une animation de graphique qui bouge
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
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-28">
      
      {/* Header Info */}
      <div className="mb-6 px-2">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Live Monitoring</h1>
        <p className="text-slate-400 text-sm mb-4">System Active & Scanning Infrastructure</p>
        
        <div className="inline-flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-full border border-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-300">ESP32 connected</span>
        </div>
      </div>

      {/* Grid pour Pression et Débit */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Pression (PSI) */}
        <div className="bg-[#1e293b] rounded-[20px] p-5 shadow-lg border border-slate-700/50 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <ArrowDownToLine className="w-5 h-5 text-cyan-400" />
            <span className="bg-cyan-900/40 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-800 uppercase tracking-wide">
              Optimal
            </span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{data.pressure.toFixed(1)}</span>
            <span className="text-slate-400 pb-1 font-medium text-sm">PSI</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold">Water Pressure</p>
          
          {/* Progress bar line */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-1 bg-cyan-500 rounded-r-full" style={{ width: '70%' }}></div>
          </div>
        </div>

      </div>

      {/* Statut Global */}
      <div className="bg-[#1e293b] rounded-[20px] p-5 shadow-lg border border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Healthy</h2>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
          Pipe Status: No leaks detected
        </div>
      </div>

      {/* Graphique de Télémétrie */}
      <div className="bg-[#1e293b] rounded-[20px] p-5 shadow-lg border border-slate-700/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-white font-bold">Flow Telemetry</h3>
            <p className="text-slate-500 text-xs">(60s)</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Live Flow
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span> Baseline
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <YAxis hide domain={['auto', 'auto']} />
              <Bar 
                dataKey="flow" 
                fill="#06b6d4" 
                radius={[2, 2, 0, 0]} 
                isAnimationActive={false} // Désactivé car on simule du temps réel
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-2 tracking-widest uppercase">
          <span>60s ago</span>
          <span>30s ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Diagnostics Techniques */}
      <div className="bg-[#1e293b] rounded-[20px] p-5 shadow-lg border border-slate-700/50">
        <h3 className="text-white font-bold mb-4">Technical Diagnostics</h3>
        
        <div className="space-y-4">
          <DiagRow label="Node ID" value="WLG-ESP32-X88" />
          <DiagRow label="Uptime" value="14d 06h 22m" />
          <DiagRow label="Signal Strength" value={<span className="text-cyan-400 flex items-center gap-1">{data.signalStrength} dBm <Wifi className="w-3 h-3"/></span>} />
          <DiagRow label="Firmware" value="v2.4.1-stable" />
        </div>
      </div>

    </div>
  );
}

function DiagRow({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}