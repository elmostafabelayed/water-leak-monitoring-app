import React from 'react';
import { LayoutDashboard, LineChart, Bell, Settings, Droplet } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWaterSystem } from '../context/WaterContext';

type Tab = 'dashboard' | 'stats' | 'alerts' | 'settings';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

export function MobileLayout({ children, currentTab, onChangeTab }: MobileLayoutProps) {
  const { alerts } = useWaterSystem();
  const unreadAlertsCount = alerts.filter(a => !a.acknowledged && a.severity !== 'LOW').length;

  return (
    <div className="flex justify-center bg-slate-950 min-h-screen font-sans text-slate-300">
      {/* Simulation d'un écran de smartphone (max-w-md centre le conteneur) */}
      <div className="w-full max-w-[420px] bg-[#0f172a] shadow-2xl relative flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Header/Status Bar */}
        <header className="flex justify-between items-center px-6 pt-10 pb-4 bg-[#0f172a] sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
            <Droplet className="w-6 h-6 text-cyan-400" strokeWidth={2.5} />
            <span className="font-bold text-lg tracking-wider text-cyan-400 uppercase">
              Water Leak <span className="text-white">Guardian</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-slate-700">
            <span className="text-xs">U</span>
          </div>
        </header>

        {/* Zone de contenu défilable */}
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          {children}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 w-full bg-[#1e293b] border-t border-slate-800 flex justify-around items-center h-20 px-2 pb-safe z-50">
          <NavItem 
            icon={<LayoutDashboard className="w-6 h-6" />} 
            label="Dashboard" 
            isActive={currentTab === 'dashboard'} 
            onClick={() => onChangeTab('dashboard')} 
          />
          <NavItem 
            icon={<LineChart className="w-6 h-6" />} 
            label="Stats" 
            isActive={currentTab === 'stats'} 
            onClick={() => onChangeTab('stats')} 
          />
          <NavItem 
            icon={<Bell className="w-6 h-6" />} 
            label="Alerts" 
            isActive={currentTab === 'alerts'} 
            onClick={() => onChangeTab('alerts')}
            badge={unreadAlertsCount}
          />
          <NavItem 
            icon={<Settings className="w-6 h-6" />} 
            label="Settings" 
            isActive={currentTab === 'settings'} 
            onClick={() => onChangeTab('settings')} 
          />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  badge = 0 
}: { 
  icon: React.ReactNode, 
  label: string, 
  isActive: boolean, 
  onClick: () => void,
  badge?: number
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 w-full transition-all duration-200 relative",
        isActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-400"
      )}
    >
      {/* Badge Notification */}
      {badge > 0 && (
        <span className="absolute top-1 right-1/4 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1e293b]">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      
      {/* Effet actif (Bg arrondi derrière l'icône) */}
      <div className={cn(
        "p-1.5 rounded-xl transition-all",
        isActive && "bg-cyan-950/50"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );
}