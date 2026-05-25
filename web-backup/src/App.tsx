import { useState } from 'react';
import { WaterProvider } from './context/WaterContext';
import { MobileLayout } from './components/MobileLayout';
import { LoginScreen } from './screens/Login';
import { DashboardScreen } from './screens/Dashboard';
import { StatsScreen } from './screens/Stats';
import { AlertsScreen } from './screens/Alerts';
import { SettingsScreen } from './screens/Settings';

type Tab = 'dashboard' | 'stats' | 'alerts' | 'settings';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Si non connecté, afficher l'écran de login
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  // Composant de rendu conditionnel pour le routeur
  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen />;
      case 'stats':     return <StatsScreen />;
      case 'alerts':    return <AlertsScreen />;
      case 'settings':  return <SettingsScreen />;
      default:          return <DashboardScreen />;
    }
  };

  // Une fois connecté, encapsuler le tout dans le WaterProvider (ESP32 simulation)
  return (
    <WaterProvider>
      <MobileLayout currentTab={activeTab} onChangeTab={setActiveTab}>
        {renderScreen()}
      </MobileLayout>
    </WaterProvider>
  );
}