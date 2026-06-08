import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Activity, BarChart2, Bell, Settings } from 'lucide-react-native';
import api, { unwrap } from '../../services/ApiService';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        const res = await api.get('/api/alerts/unread-count');
        const data = unwrap(res);
        const next = typeof data?.count === 'number' && !Number.isNaN(data.count) ? data.count : 0;
        if (mounted) setUnreadCount(next);
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const sidebarWidth = isTablet ? 110 : 0;

  return (
    <View className="flex-1" style={{ backgroundColor: '#0A0E1A' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#00BCD4',
          tabBarInactiveTintColor: '#64748b',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0A0E1A',
            borderBottomWidth: 1,
            borderBottomColor: '#1E293B',
          },
          headerTitleStyle: {
            color: '#f8fafc',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontSize: 14,
          },
          tabBarStyle: {
            backgroundColor: '#0A0E1A',
            ...(isTablet
              ? {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: sidebarWidth,
                  height: '100%',
                  borderRightWidth: 1,
                  borderRightColor: '#1E293B',
                  paddingTop: 60,
                  paddingBottom: 40,
                }
              : {
                  borderTopWidth: 1,
                  borderTopColor: '#1E293B',
                  height: 85,
                  paddingBottom: 25,
                  paddingTop: 10,
                }),
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
          sceneStyle: { backgroundColor: '#0A0E1A', ...(isTablet ? { marginLeft: sidebarWidth } : {}) },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tableau de bord',
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="monitoring"
          options={{
            title: 'Surveillance',
            tabBarIcon: ({ color }) => <Activity size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistiques',
            tabBarIcon: ({ color }) => <BarChart2 size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alertes',
            tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Paramètres',
            tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
