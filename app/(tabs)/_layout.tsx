import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BarChart2, Bell, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#64748b',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#020617',
          borderBottomWidth: 1,
          borderBottomColor: '#1e293b',
        },
        headerTitleStyle: {
          color: '#f8fafc',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 2,
          fontSize: 14,
        },
        tabBarStyle: {
          backgroundColor: '#020617',
          borderTopWidth: 1,
          borderTopColor: '#1e293b',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Monitoring',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
