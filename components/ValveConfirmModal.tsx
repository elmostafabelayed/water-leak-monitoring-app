import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';

interface ValveConfirmModalProps {
  visible: boolean;
  action: 'OPEN' | 'CLOSE';
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ValveConfirmModal({
  visible,
  action,
  loading,
  onConfirm,
  onCancel,
}: ValveConfirmModalProps) {
  const isOpen = action === 'OPEN';

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/70 justify-center items-center px-6">
        <View
          className="w-full rounded-3xl p-8 border border-slate-700"
          style={{ backgroundColor: '#131929' }}
        >
          <Text className="text-white font-black text-xl text-center mb-3 tracking-tight">
            Confirmation requise
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-8 leading-6">
            Êtes-vous sûr de vouloir {isOpen ? 'OUVRIR' : 'FERMER'} la vanne principale ?
          </Text>

          <TouchableOpacity
            onPress={onConfirm}
            disabled={loading}
            className={`w-full py-4 rounded-2xl mb-3 items-center flex-row justify-center gap-2 ${
              isOpen ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-black text-sm tracking-widest uppercase">
                {isOpen ? 'Ouvrir la vanne' : 'Fermer la vanne'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            className="w-full py-4 rounded-2xl items-center border border-slate-700"
            activeOpacity={0.8}
          >
            <Text className="text-slate-400 font-black text-sm tracking-widest uppercase">
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
