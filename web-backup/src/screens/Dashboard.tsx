import { useWaterSystem } from '../context/WaterContext';
import { Droplet, ActivitySquare, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export function DashboardScreen() {
  const { data, toggleValve, simulateLeak } = useWaterSystem();

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-28">
      
      {/* Simulation de Fuite (Pour tester) */}
      <div className="flex justify-end mb-2">
        <button 
          onClick={simulateLeak} 
          className="text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/50 px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.2)] hover:bg-rose-500/30 transition-all"
        >
          <AlertTriangle className="w-3 h-3" /> Simulate Leak
        </button>
      </div>

      {/* Carte "Live Flow Rate" */}
      <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50 relative overflow-hidden">
        {/* Glow de fond subtil */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
        
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-slate-400 font-semibold tracking-wider text-xs uppercase">Live Flow Rate</h2>
          <span className="flex items-center gap-1 bg-cyan-950 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            NORMAL
          </span>
        </div>
        
        <div className="flex items-end gap-2 my-4">
          <span className="text-6xl font-black text-cyan-400 tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            {data.flowRate.toFixed(1)}
          </span>
          <span className="text-xl text-slate-400 pb-2">L/min</span>
        </div>

        {/* Mini Graphique de barres animées */}
        <div className="flex items-end gap-1.5 h-16 mt-6 opacity-80">
          {[40, 60, 45, 70, 85, 65, 90, 75, 55, 45].map((height, i) => (
            <div 
              key={i} 
              className={cn(
                "w-full bg-cyan-700/40 rounded-t-sm transition-all duration-300",
                i >= 7 ? "bg-cyan-500" : "" // Met en valeur les dernières barres
              )} 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Contrôle de la Vanne Principale */}
      <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50 flex flex-col items-center">
        <h2 className="text-slate-400 font-semibold tracking-wider text-xs uppercase mb-6">Main Supply Valve</h2>
        
        {/* Bouton Circulaire Géant */}
        <div className="relative group cursor-pointer mb-6" onClick={toggleValve}>
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl transition-all duration-500",
            data.valveOpen ? "bg-cyan-500/30 group-hover:bg-cyan-400/50" : "bg-slate-600/30"
          )}></div>
          <div className={cn(
            "w-32 h-32 rounded-full border-4 flex items-center justify-center relative z-10 transition-all duration-300",
            data.valveOpen ? "border-cyan-400 bg-cyan-950/80 shadow-[0_0_30px_rgba(34,211,238,0.2)]" : "border-slate-500 bg-slate-800/80"
          )}>
            <Droplet className={cn(
              "w-12 h-12 transition-all duration-500", 
              data.valveOpen ? "text-cyan-400 scale-110" : "text-slate-500 scale-90"
            )} strokeWidth={2.5} />
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-white mb-1 tracking-wide">
            {data.valveOpen ? 'OPEN' : 'CLOSED'}
          </p>
          <p className="text-slate-400 text-sm italic">
            {data.valveOpen ? 'Operational • No leaks detected' : 'Supply secured manually.'}
          </p>
        </div>

        {/* Bouton d'action rectangulaire (comme sur la maquette) */}
        <button 
          onClick={toggleValve}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex justify-center items-center gap-2 transition-all shadow-lg active:scale-[0.98]",
            data.valveOpen 
              ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-cyan-500/20" 
              : "bg-slate-700 hover:bg-slate-600 text-white"
          )}
        >
          {data.valveOpen ? (
             <><div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"/> CLOSE VALVE</>
          ) : (
            <><Droplet className="w-4 h-4" /> OPEN VALVE</>
          )}
        </button>
      </div>

      {/* Daily Usage */}
      <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <ActivitySquare className="w-5 h-5 text-slate-400" />
          <h2 className="text-white font-semibold">Daily Usage</h2>
        </div>
        
        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-bold text-white tabular-nums">{Math.floor(data.dailyUsage)}</span>
          <span className="text-slate-400 pb-1">Liters</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-2 relative overflow-hidden">
          <div className="bg-cyan-500 h-2 rounded-full absolute left-0 top-0 transition-all duration-1000" style={{ width: '65%' }}></div>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">65% of daily limit</p>
      </div>

    </div>
  );
}