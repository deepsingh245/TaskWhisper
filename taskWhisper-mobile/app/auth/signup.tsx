import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, ArrowRight, Chrome, Facebook, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { registerUser } from '@/app/store/thunks/authThunks';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) return;

    try {
      const resultAction = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(resultAction)) {
        router.replace('/(tabs)');
      } else {
        console.log("Signup failed", resultAction.payload);
      }
    } catch (err) {
      console.error("Signup Error", err);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.tint, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Background Orbs */}
      <View style={[styles.orb, { top: '10%', left: '-10%', backgroundColor: colors.primary, opacity: 0.2 }]} />
      <View style={[styles.orb, { bottom: '10%', right: '-10%', backgroundColor: colors.secondary, opacity: 0.2 }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.card}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create an account</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              Enter your details to get started with TaskWhisper
            </Text>
          </View>

          {error && (
            <View style={{ marginBottom: 10, padding: 10, backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: 8 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                <User size={20} color={colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.icon}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                <Mail size={20} color={colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.icon}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                <Lock size={20} color={colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.icon}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Get Started</Text>
                  <ArrowRight size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.icon }]}>OR SIGN UP WITH</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                <Chrome size={20} color={colors.text} />
                <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                <Facebook size={20} color="#1877F2" />
                <Text style={[styles.socialButtonText, { color: colors.text }]}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.icon }]}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { color: colors.tint }]}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    // filter: 'blur(50px)', // Removed as it is not supported in RN
  },
  content: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
