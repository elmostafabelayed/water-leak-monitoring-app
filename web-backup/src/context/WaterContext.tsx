import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Alert {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  severity: AlertSeverity;
  acknowledged: boolean;
  type: 'LEAK' | 'PRESSURE' | 'SYSTEM' | 'ACTION';
}

interface WaterData {
  flowRate: number;    // L/min
  pressure: number;    // PSI
  valveOpen: boolean;  // État de la vanne (Relais ESP32)
  battery: number;     // % batterie
  signalStrength: number; // dBm WiFi
  dailyUsage: number;  // Litres consommés aujourd'hui
  isLeakDetected: boolean;
}

interface WaterContextType {
  data: WaterData;
  alerts: Alert[];
  toggleValve: () => void;
  acknowledgeAlert: (id: string) => void;
  simulateLeak: () => void; // Fonction de test
}

const WaterContext = createContext<WaterContextType | undefined>(undefined);

export function WaterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WaterData>({
    flowRate: 12.5,
    pressure: 54.2,
    valveOpen: true,
    battery: 94,
    signalStrength: -58,
    dailyUsage: 428,
    isLeakDetected: false,
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      title: 'Auto-calibration Complete',
      description: 'System sensors calibrated successfully.',
      severity: 'LOW',
      acknowledged: true,
      type: 'SYSTEM'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h ago
      title: 'Pressure Spike Detected',
      description: 'Brief fluctuation resolved automatically.',
      severity: 'MEDIUM',
      acknowledged: true,
      type: 'PRESSURE'
    }
  ]);

  // Simulation du flux de données en temps réel (Polling/WebSocket ESP32)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (data.valveOpen && !data.isLeakDetected) {
      interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          // Variation légère du débit (12.0 à 13.0)
          flowRate: Number((12 + Math.random()).toFixed(1)),
          // Variation légère de pression (54.0 à 54.5)
          pressure: Number((54 + (Math.random() * 0.5)).toFixed(1)),
          // Incrémenter l'usage doucement
          dailyUsage: prev.dailyUsage + 0.1,
        }));
      }, 2000);
    } else if (!data.valveOpen) {
      // Si la vanne est fermée, le débit chute à 0
      setData(prev => ({
        ...prev,
        flowRate: 0,
        pressure: 60.5 // Pression statique monte souvent quand fermé
      }));
    }

    return () => clearInterval(interval);
  }, [data.valveOpen, data.isLeakDetected]);

  // Action: Fermer/Ouvrir la vanne (Ici on enverrait la requête à l'ESP32)
  const toggleValve = useCallback(() => {
    setData(prev => {
      const newState = !prev.valveOpen;
      // Ajouter une alerte d'action
      setAlerts(curr => [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        title: newState ? 'Valve Opened' : 'Valve Closed',
        description: newState ? 'Main supply restored manually.' : 'Main supply shut off manually.',
        severity: 'LOW',
        acknowledged: false,
        type: 'ACTION'
      }, ...curr]);
      
      return { ...prev, valveOpen: newState, isLeakDetected: false };
    });
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const simulateLeak = useCallback(() => {
    setData(prev => ({ ...prev, isLeakDetected: true, flowRate: 45.2, pressure: 20.1 }));
    setAlerts(curr => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      title: 'CRITICAL ALERT: Leak Detected',
      description: 'Abnormal continuous flow detected in Main Supply Line. Flow rate exceeded 15 GPM.',
      severity: 'CRITICAL',
      acknowledged: false,
      type: 'LEAK'
    }, ...curr]);
    
    // Auto-fermeture de la vanne de sécurité (simulation du comportement automatique)
    setTimeout(() => {
      setData(prev => ({ ...prev, valveOpen: false }));
      setAlerts(curr => [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        title: 'Emergency Shutdown Executed',
        description: 'Main valve automatically closed to prevent damage following critical leak.',
        severity: 'HIGH',
        acknowledged: false,
        type: 'ACTION'
      }, ...curr]);
    }, 3000);
  }, []);

  return (
    <WaterContext.Provider value={{ data, alerts, toggleValve, acknowledgeAlert, simulateLeak }}>
      {children}
    </WaterContext.Provider>
  );
}

export const useWaterSystem = () => {
  const context = useContext(WaterContext);
  if (!context) throw new Error("useWaterSystem must be used within a WaterProvider");
  return context;
};