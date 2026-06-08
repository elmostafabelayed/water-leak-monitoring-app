import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  Lock,
  Mail,
  ArrowRight,
  User,
  Phone,
  Eye,
  EyeOff,
  Check,
  Home,
  Building2,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Role = 'home' | 'municipal';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<Role>('home');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successScale = useSharedValue(0);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!acceptedTerms) {
      setError('Vous devez accepter les conditions générales.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name);
      setSuccess(true);
      successScale.value = withSequence(
        withSpring(1, { damping: 8 }),
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 300 })
      );
    } catch (e) {
      setError('Échec de l\'inscription. Veuillez réessayer.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#0A0E1A' }}>
        <Animated.View style={successStyle} className="items-center">
          <View className="w-24 h-24 rounded-full bg-emerald-500/20 items-center justify-center border-4 border-emerald-500 mb-6">
            <Check size={48} color="#22C55E" strokeWidth={3} />
          </View>
          <Text className="text-2xl font-black text-white text-center mb-2">
            Compte créé !
          </Text>
          <Text className="text-slate-400 text-sm text-center px-8">
            Bienvenue sur Water Leak Guardian
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: '#0A0E1A' }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 p-8 justify-center">
        <View className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full" />
        <View className="absolute bottom-40 left-0 w-48 h-48 bg-cyan-600/10 rounded-full" />

        <View className="items-center mb-8">
          <View className="mb-6">
            <Image
              source={require('../assets/images/logo-pro.png')}
              style={{ width: 100, height: 100, borderRadius: 15 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-black text-white tracking-tight text-center">
            Créer un <Text style={{ color: '#00BCD4' }}>compte</Text>
          </Text>
          <Text className="text-slate-500 text-sm mt-3 text-center px-4 font-bold uppercase tracking-widest">
            Rejoignez le réseau de surveillance
          </Text>
        </View>

        <View
          className="rounded-3xl p-8 border shadow-2xl"
          style={{ backgroundColor: '#131929', borderColor: '#1E293B' }}
        >
          {error && (
            <View className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6">
              <Text className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </Text>
            </View>
          )}

          <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3">
            Type de compte
          </Text>
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setRole('home')}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl border',
                role === 'home'
                  ? 'bg-cyan-500/20 border-cyan-500'
                  : 'bg-slate-950 border-slate-800'
              )}
            >
              <Home size={18} color={role === 'home' ? '#00BCD4' : '#64748B'} />
              <Text
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  role === 'home' ? 'text-cyan-400' : 'text-slate-500'
                )}
              >
                Particulier
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole('municipal')}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl border',
                role === 'municipal'
                  ? 'bg-cyan-500/20 border-cyan-500'
                  : 'bg-slate-950 border-slate-800'
              )}
            >
              <Building2 size={18} color={role === 'municipal' ? '#00BCD4' : '#64748B'} />
              <Text
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  role === 'municipal' ? 'text-cyan-400' : 'text-slate-500'
                )}
              >
                Opérateur municipal
              </Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-5">
            <Field label="Nom complet" icon={<User size={20} color="#475569" />}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jean Dupont"
                placeholderTextColor="#334155"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 font-bold"
              />
            </Field>

            <Field label="E-mail" icon={<Mail size={20} color="#475569" />}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="nom@exemple.fr"
                placeholderTextColor="#334155"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 font-bold"
              />
            </Field>

            <Field label="Téléphone" icon={<Phone size={20} color="#475569" />}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+33 6 12 34 56 78"
                placeholderTextColor="#334155"
                keyboardType="phone-pad"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 font-bold"
              />
            </Field>

            <Field label="Mot de passe" icon={<Lock size={20} color="#475569" />}>
              <TextInput
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-12 font-bold"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </Field>

            <Field label="Confirmer le mot de passe" icon={<Lock size={20} color="#475569" />}>
              <TextInput
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className={cn(
                  'w-full bg-slate-950 border text-white rounded-2xl py-4 pl-14 pr-12 font-bold',
                  passwordsMismatch ? 'border-red-500' : passwordsMatch ? 'border-emerald-500' : 'border-slate-800'
                )}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-4"
              >
                {showConfirm ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </Field>

            {passwordsMismatch && (
              <Text className="text-red-500 text-[10px] font-black uppercase tracking-widest -mt-2">
                Les mots de passe ne correspondent pas
              </Text>
            )}
            {passwordsMatch && (
              <View className="flex-row items-center gap-2 -mt-2">
                <Check size={14} color="#22C55E" />
                <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  Les mots de passe correspondent
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              className="flex-row items-start gap-3 mt-2"
            >
              <View
                className={cn(
                  'w-5 h-5 rounded border items-center justify-center mt-0.5',
                  acceptedTerms ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 bg-slate-950'
                )}
              >
                {acceptedTerms && <Check size={12} color="#0A0E1A" strokeWidth={3} />}
              </View>
              <Text className="text-slate-400 text-xs flex-1 leading-5">
                J'accepte les{' '}
                <Text style={{ color: '#00BCD4' }}>conditions générales d'utilisation</Text> et la
                politique de confidentialité.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="w-full mt-4 h-16 rounded-2xl items-center justify-center flex-row gap-3 shadow-2xl active:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: '#00BCD4' }}
            >
              {loading ? (
                <ActivityIndicator color="#0A0E1A" />
              ) : (
                <>
                  <Text className="font-black text-sm tracking-widest" style={{ color: '#0A0E1A' }}>
                    CRÉER MON COMPTE
                  </Text>
                  <ArrowRight size={18} color="#0A0E1A" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/login')} className="mt-8 items-center">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Déjà un compte ? <Text style={{ color: '#00BCD4' }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-3">
        {label}
      </Text>
      <View className="relative">
        <View className="absolute left-4 top-4 z-10">{icon}</View>
        {children}
      </View>
    </View>
  );
}
