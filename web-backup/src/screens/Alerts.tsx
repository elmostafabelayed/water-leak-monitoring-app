import { useWaterSystem, Alert } from '../context/WaterContext';
import { BellRing, ShieldAlert, Activity, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

export function AlertsScreen() {
  const { alerts, acknowledgeAlert } = useWaterSystem();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'SYSTEM'>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL' || a.severity === 'HIGH';
    if (filter === 'SYSTEM') return a.type === 'SYSTEM' || a.type === 'ACTION';
    return true;
  });

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-28">
      
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Event Logs</h1>
        <div className="flex gap-2">
          <FilterPill label="All Logs" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
          <FilterPill label="Critical" active={filter === 'CRITICAL'} onClick={() => setFilter('CRITICAL')} />
          <FilterPill label="System" active={filter === 'SYSTEM'} onClick={() => setFilter('SYSTEM')} />
        </div>
      </div>

      {/* Timeline des Alertes */}
      <div className="space-y-4 pl-3 border-l-2 border-slate-800 ml-4 relative">
        {filteredAlerts.length === 0 ? (
          <p className="text-slate-500 italic text-sm py-4">No events found for this filter.</p>
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
        
        {/* End of line marker */}
        <div className="absolute -bottom-6 -left-[5px] w-2 h-2 rounded-full bg-slate-700"></div>
      </div>

      {/* Info Archive */}
      <div className="mt-12 bg-[#1e293b]/50 border border-slate-800 border-dashed rounded-[20px] p-6 text-center text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-xs">Viewing data from the last 30 days. Older logs are archived in the cloud repository.</p>
      </div>

    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border",
        active 
          ? "bg-cyan-900/40 text-cyan-400 border-cyan-800" 
          : "bg-[#1e293b] text-slate-400 border-slate-700 hover:bg-slate-800"
      )}
    >
      {label}
    </button>
  );
}

function AlertCard({ alert, onAcknowledge, isLatest }: { alert: Alert, onAcknowledge: () => void, isLatest: boolean }) {
  // Styles selon la sévérité
  const styles = {
    CRITICAL: { bg: 'bg-rose-950/40', border: 'border-rose-900/50', line: 'bg-rose-500', icon: ShieldAlert, iconCol: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/50' },
    HIGH: { bg: 'bg-orange-950/40', border: 'border-orange-900/50', line: 'bg-orange-500', icon: BellRing, iconCol: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
    MEDIUM: { bg: 'bg-yellow-950/40', border: 'border-yellow-900/50', line: 'bg-yellow-500', icon: Activity, iconCol: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
    LOW: { bg: 'bg-[#1e293b]', border: 'border-slate-800', line: 'bg-cyan-500', icon: CheckCircle, iconCol: 'text-cyan-400', badge: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
  }[alert.severity];

  const Icon = styles.icon;

  return (
    <div className="relative pl-6 pb-2 pt-1 group">
      {/* Point sur la timeline */}
      <div className={cn(
        "absolute -left-[27px] top-4 w-3 h-3 rounded-full border-2 border-slate-950 z-10",
        styles.line,
        isLatest && "ring-4 ring-slate-900 animate-pulse"
      )}></div>

      {/* Ligne lumineuse à gauche de la carte */}
      <div className={cn(
        "absolute top-1 bottom-1 left-2 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity",
        styles.line
      )}></div>

      {/* Carte */}
      <div className={cn(
        "rounded-[20px] p-4 shadow-lg border relative overflow-hidden transition-all",
        styles.bg, styles.border,
        !alert.acknowledged && "ring-1 ring-white/10"
      )}>
        {/* Unread indicator */}
        {!alert.acknowledged && (
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
        )}

        <div className="flex gap-4">
          <div className={cn("p-2 rounded-xl h-fit bg-black/20", styles.iconCol)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-white tracking-wide">{alert.title}</h3>
            </div>
            <p className="text-slate-400 text-sm mb-3 leading-relaxed">{alert.description}</p>
            
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <Clock className="w-3 h-3" />
                {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <span className={cn("px-2 py-0.5 rounded-full border font-semibold tracking-wider uppercase text-[9px]", styles.badge)}>
                {alert.severity}
              </span>
            </div>

            {/* Bouton pour acquitter si non lu */}
            {!alert.acknowledged && (
              <button 
                onClick={onAcknowledge}
                className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Acknowledge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}