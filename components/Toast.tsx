import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

interface ToastProps {
  message: string | null;
  onHide: () => void;
}

export default function Toast({ message, onHide }: ToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    if (!message) return;

    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(1, { duration: 2500 }),
      withTiming(0, { duration: 300 }, () => {
        runOnJS(onHide)();
      })
    );
    translateY.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(0, { duration: 2500 }),
      withTiming(-20, { duration: 300 })
    );
  }, [message]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute top-16 left-4 right-4 z-50 bg-emerald-500/90 rounded-2xl px-5 py-4 shadow-2xl"
    >
      <Text className="text-white font-black text-xs text-center uppercase tracking-widest">
        {message}
      </Text>
    </Animated.View>
  );
}
