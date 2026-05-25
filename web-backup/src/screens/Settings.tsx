import { useWaterSystem } from '../context/WaterContext';
import { Wifi, Battery, RotateCcw, Settings2, BellRing, Mail, Activity } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function SettingsScreen() {
  const { data } = useWaterSystem();
  const [autoMode, setAutoMode] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-28">
      
      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Configuration</h1>
        <p className="text-slate-400 text-sm">Fine-tune your sentinel's monitoring parameters.</p>
      </div>

      {/* Connectivité */}
      <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-cyan-400 font-semibold tracking-wider text-xs uppercase">Connectivity</h2>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          </div>
          <span className="text-slate-300 font-medium">ESP32 Online</span>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center border border-slate-800">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-slate-400" />
              <span className="text-white font-medium text-sm">Signal Strength</span>
            </div>
            <span className="text-cyan-400 font-mono font-bold tracking-tight">{data.signalStrength} dBm</span>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center border border-slate-800">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-slate-400" />
              <span className="text-white font-medium text-sm">SSID</span>
            </div>
            <span className="text-slate-300 font-mono tracking-tight text-sm">Industrial_Grid_A4</span>
          </div>
        </div>
      </div>

      {/* Santé Système */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50 flex flex-col justify-center">
          <Battery className="w-6 h-6 text-cyan-400 mb-3" />
          <p className="text-slate-400 text-xs font-semibold mb-1">Battery</p>
          <p className="text-2xl font-bold text-white tracking-tighter">{data.battery}%</p>
        </div>

        <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50 flex flex-col justify-center">
          <RotateCcw className="w-6 h-6 text-cyan-400 mb-3" />
          <p className="text-slate-400 text-xs font-semibold mb-1">Firmware</p>
          <p className="text-xl font-bold text-white tracking-tighter">v2.4.1</p>
        </div>
      </div>

      {/* Contrôle Vanne (Automatique vs Manuel) */}
      <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Settings2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Valve Control Mode</h3>
            <p className="text-slate-400 text-xs">Define shutdown protocol behavior.</p>
          </div>
        </div>

        <div className="bg-slate-900 flex rounded-xl p-1 mt-6 border border-slate-800 relative">
          {/* Background animée */}
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-cyan-500 rounded-lg transition-all duration-300 ease-in-out z-0"
            style={{ left: autoMode ? '4px' : 'calc(50%)' }}
          ></div>

          <button 
            onClick={() => setAutoMode(true)}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 relative z-10 transition-colors duration-300",
              autoMode ? "text-slate-900" : "text-slate-400"
            )}
          >
            <RotateCcw className="w-4 h-4" /> Automatic
          </button>
          <button 
            onClick={() => setAutoMode(false)}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 relative z-10 transition-colors duration-300",
              !autoMode ? "text-slate-900" : "text-slate-400"
            )}
          >
            <Settings2 className="w-4 h-4" /> Manual
          </button>
        </div>
        <p className="text-slate-500 text-[10px] mt-4 italic">
          "Automatic" will instantly close the main valve if a critical leak is detected.
        </p>
      </div>

      {/* Sensibilité Fuite */}
      <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50">
         <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-800 rounded-lg">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-white font-bold">Leak Sensitivity</h3>
          </div>
          <span className="bg-cyan-950 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-cyan-900">
            Balanced
          </span>
         </div>
         
         <div className="relative pt-1">
           <input
             type="range"
             min="0"
             max="100"
             value={sensitivity}
             onChange={(e) => setSensitivity(Number(e.target.value))}
             className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
           />
           <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3">
             <span>Precision (Low)</span>
             <span>Reactive (High)</span>
           </div>
         </div>
      </div>

      {/* Alertes Preferences */}
      <div className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-700/50 mb-10">
        <h3 className="text-slate-400 font-semibold tracking-wider text-xs uppercase mb-6">Alert Preferences</h3>
        
        <div className="space-y-4">
          <ToggleRow 
            icon={<BellRing className="w-5 h-5 text-slate-400" />}
            title="Push Notifications"
            desc="Real-time mobile alerts"
            active={pushNotifs}
            onChange={() => setPushNotifs(!pushNotifs)}
          />
          <ToggleRow 
            icon={<Mail className="w-5 h-5 text-slate-400" />}
            title="Email Alerts"
            desc="Weekly summaries & reports"
            active={emailNotifs}
            onChange={() => setEmailNotifs(!emailNotifs)}
          />
        </div>
      </div>

    </div>
  );
}

function ToggleRow({ icon, title, desc, active, onChange }: { icon: React.ReactNode, title: string, desc: string, active: boolean, onChange: () => void }) {
  return (
    <div className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center border border-slate-800 cursor-pointer" onClick={onChange}>
      <div className="flex gap-4 items-center">
        {icon}
        <div>
          <p className="text-white font-bold text-sm tracking-wide">{title}</p>
          <p className="text-slate-500 text-xs">{desc}</p>
        </div>
      </div>

      {/* Switch Style iOS */}
      <div className={cn(
        "w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex",
        active ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"
      )}>
        <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300"></div>
      </div>
    </div>
  );
}