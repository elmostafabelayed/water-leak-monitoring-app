import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Droplet, Lock, Mail, ArrowRight, User, Shield, Activity as ActivityIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all security fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name);
      // Auth flow in _layout will handle redirection
    } catch (e) {
      setError('System authentication failure. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 p-8 justify-center">
        
        {/* Glow Effects */}
        <View className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <View className="absolute bottom-40 left-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

        {/* Header Logo */}
        <View className="items-center mb-8">
          <View className="mb-6 shadow-2xl">
            <Image 
              source={require('../assets/images/logo-pro.png')} 
              style={{ width: 100, height: 100, borderRadius: 15 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-black text-white tracking-tight text-center">
            Create Operator <Text className="text-cyan-400">Account</Text>
          </Text>
          <Text className="text-slate-500 text-sm mt-3 text-center px-4 font-bold uppercase tracking-widest">
            Join the municipal monitoring network
          </Text>
        </View>

        {/* Form */}
        <View className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
          {error && (
            <View className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6">
              <Text className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</Text>
            </View>
          )}
          <View className="space-y-5">
            <View>
              <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3">Full Name</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <User size={20} color="#475569" />
                </View>
                <TextInput 
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor="#334155"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 font-bold"
                />
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3">Work Email</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Mail size={20} color="#475569" />
                </View>
                <TextInput 
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@citygrid.io"
                  placeholderTextColor="#334155"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 font-bold"
                />
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3">Password</Text>
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
              onPress={handleRegister}
              disabled={loading}
              className="w-full mt-6 h-16 rounded-2xl bg-cyan-500 items-center justify-center flex-row gap-3 shadow-2xl active:opacity-80 disabled:opacity-50"
            >
              {loading ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <>
                  <Text className="text-slate-950 font-black text-sm tracking-widest">CREATE ACCOUNT</Text>
                  <ArrowRight size={18} color="#020617" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/login')} className="mt-8 items-center">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Already have an account? <Text className="text-cyan-400">Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}
