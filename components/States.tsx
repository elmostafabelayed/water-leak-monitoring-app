import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { WifiOff, Database } from 'lucide-react-native';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: '#0A0E1A' }}>
      <WifiOff size={44} color="#64748B" />
      <Text className="text-white font-black text-lg text-center mt-4">
        Impossible de se connecter au serveur
      </Text>
      <Text className="text-slate-500 font-bold text-sm text-center mt-2">
        Vérifiez votre connexion réseau
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="mt-6 px-6 py-4 rounded-2xl border border-cyan-800"
        style={{ backgroundColor: '#131929' }}
        activeOpacity={0.8}
      >
        <Text className="text-cyan-400 font-black text-xs uppercase tracking-widest">Réessayer</Text>
      </TouchableOpacity>
    </View>
  );
}

export function EmptyState({ text }: { text?: string }) {
  return (
    <View className="items-center justify-center px-8 py-12">
      <Database size={40} color="#64748B" />
      <Text className="text-white font-black text-base text-center mt-4">
        {text || 'Aucune donnée disponible'}
      </Text>
    </View>
  );
}

export function SkeletonBlock({
  height,
  width,
  borderRadius = 16,
}: {
  height: number;
  width?: number | string;
  borderRadius?: number;
}) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        opacity,
        height,
        width: width ?? '100%',
        borderRadius,
        backgroundColor: '#1E293B',
      }}
    />
  );
}

