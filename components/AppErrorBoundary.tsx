import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  children: React.ReactNode;
  onReset: () => void;
};

type State = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.log('ErrorBoundary:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: '#0A0E1A' }}>
        <Text className="text-white text-xl font-black text-center mb-3">
          Une erreur inattendue s'est produite
        </Text>
        <Text className="text-slate-500 text-sm font-bold text-center mb-8">
          Redémarrez l'application pour continuer.
        </Text>
        <TouchableOpacity
          onPress={this.props.onReset}
          className="px-6 py-4 rounded-2xl"
          style={{ backgroundColor: '#00BCD4' }}
          activeOpacity={0.8}
        >
          <Text className="font-black text-sm tracking-widest" style={{ color: '#0A0E1A' }}>
            REDÉMARRER L'APPLICATION
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

