import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Droplet, Lock, Mail, ArrowRight, Shield, Activity as ActivityIcon } from 'lucide-react-native';
import { router, Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      // Redirection is handled by _layout.tsx
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 p-8 justify-center">
        
        {/* Glow Effects (Simulated with views) */}
        <View className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <View className="absolute bottom-40 left-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

        {/* Header Logo */}
        <View className="items-center mb-12">
          <View className="mb-6 shadow-2xl">
            <Image 
              source={require('../assets/images/logo-pro.png')} 
              style={{ width: 120, height: 120, borderRadius: 20 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-4xl font-black text-white tracking-tight">
            Water Leak <Text className="text-cyan-400">Guardian</Text>
          </Text>
          <Text className="text-slate-500 text-sm mt-3 text-center px-4 font-bold uppercase tracking-widest">
            Secure municipal monitoring access
          </Text>
        </View>

        {/* Form */}
        <View className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <Text className="text-white text-2xl font-black mb-8 tracking-tight">System Login</Text>

          <View className="space-y-6">
            <View>
              <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3">Operator Email</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Mail size={20} color="#475569" />
                </View>
                <TextInput 
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#334155"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 font-bold"
                />
              </View>
            </View>

            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Password</Text>
                <TouchableOpacity>
                  <Text className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Lock size={20} color="#475569" />
                </View>
                <TextInput 
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 font-bold"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              className="w-full mt-8 h-16 rounded-2xl bg-cyan-500 items-center justify-center flex-row gap-3 shadow-2xl active:opacity-80 disabled:opacity-50"
            >
              {loading ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <>
                  <Text className="text-slate-950 font-black text-sm tracking-widest">INITIATE CONNECTION</Text>
                  <ArrowRight size={18} color="#020617" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/register')} className="mt-8 items-center">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              New operator? <Text className="text-cyan-400">Request Access</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View className="flex-row gap-4 mt-8">
          <View className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Shield size={14} color="#22d3ee" />
              <Text className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Encryption</Text>
            </View>
            <View className="w-full h-1 bg-slate-800 rounded-full mb-1">
              <View className="h-full bg-cyan-500 rounded-full w-[90%]" />
            </View>
            <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">AES-256 Bit</Text>
          </View>

          <View className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <ActivityIcon size={14} color="#22d3ee" />
              <Text className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Network</Text>
            </View>
            <Text className="text-white font-black text-xs tracking-tight">14.2 ms ping</Text>
            <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Node: US-EAST</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
