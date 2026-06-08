import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import api, { unwrap } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';

export default function LeakAlertOverlay() {
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [location, setLocation] = useState('');
  const [flowRate, setFlowRate] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulseOpacity = useSharedValue(0.3);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
          withTiming(0, { duration: 400 })
        ),
        -1,
        false
      );
    }
  }, [visible]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const { user } = useAuth();

  const fetchLeak = useCallback(async () => {
    if (!user) return; // Ne pas interroger l'API si non connecté
    
    try {
      const res = await api.get('/api/leak/status');
      const data = unwrap(res);

      const detected = !!data?.leak_detected;
      if (!detected) {
        setVisible(false);
        setDismissed(false);
        return;
      }

      if (!dismissed) {
        setVisible(true);
        setLocation(typeof data?.location === 'string' && data.location.trim() ? data.location : 'Non disponible');
        setFlowRate(typeof data?.flow_rate === 'number' && !Number.isNaN(data.flow_rate) ? data.flow_rate : 0);
      }
    } catch {
      // Ignorer les erreurs (ex: 401 non autorisé)
    }
  }, [dismissed, user]);

  useEffect(() => {
    fetchLeak();
    pollRef.current = setInterval(fetchLeak, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchLeak]);

  const dismissLeakAlert = useCallback(() => {
    setDismissed(true);
    setVisible(false);
  }, []);

  const closeValveFromLeakAlert = useCallback(async () => {
    try {
      await api.post('/api/valve/control', { action: 'close' });
    } catch {
      // ignore
    } finally {
      setDismissed(true);
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#0A0E1A' }}>
        <Animated.View
          style={[bgStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
          className="bg-red-600"
        />

        <View className="items-center px-8 z-10" style={{ width }}>
          <Animated.View style={iconStyle} className="mb-6">
            <View className="w-28 h-28 rounded-full bg-red-500/30 items-center justify-center border-4 border-red-500">
              <AlertTriangle size={56} color="#FF3B5C" strokeWidth={2.5} />
            </View>
          </Animated.View>

          <Text className="text-3xl font-black text-white text-center mb-2 tracking-tight">
            ⚠️ FUITE DÉTECTÉE
          </Text>

          <Text className="text-red-300 text-sm font-bold text-center mb-2 uppercase tracking-widest">
            {location}
          </Text>

          <Text className="text-white text-5xl font-black mb-2 tabular-nums">
            {flowRate.toFixed(1)}
          </Text>
          <Text className="text-slate-400 text-lg font-bold mb-10">L/min</Text>

          <TouchableOpacity
            onPress={closeValveFromLeakAlert}
            className="w-full bg-red-500 py-5 rounded-2xl mb-4 items-center shadow-2xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-black text-sm tracking-widest uppercase">
              Fermer la vanne maintenant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={dismissLeakAlert}
            className="w-full bg-slate-800/80 py-4 rounded-2xl items-center border border-slate-600"
            activeOpacity={0.8}
          >
            <Text className="text-slate-300 font-black text-sm tracking-widest uppercase">
              Ignorer
            </Text>
          </TouchableOpacity>

          <Text className="text-slate-500 text-[10px] font-bold mt-6 uppercase tracking-widest">
            Statut en temps réel — rafraîchi toutes les 5 secondes
          </Text>
        </View>
      </View>
    </Modal>
  );
}
