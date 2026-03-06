import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { theme } from '../src/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && session) {
      if (session.user?.email_confirmed_at) {
        router.replace('/(tabs)/income-tax' as any);
      } else {
        router.replace('/verify-email' as any);
      }
    }
  }, [session, authLoading]);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);
    const { error: signUpError } = await signUp(email.trim(), password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
    } else {
      // If we have a session now, it means Supabase auto-logged us in
      if (session) {
        router.replace('/(tabs)/income-tax' as any);
      } else {
        router.replace('/login' as any);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <UserPlus size={40} color={theme.colors.accent} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join LexTax BD</Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#6ee7b7" />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#6ee7b799"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#6ee7b7" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#6ee7b799"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#6ee7b7" />
              ) : (
                <Eye size={20} color="#6ee7b7" />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#6ee7b7" />
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#6ee7b799"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={styles.signupButton}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => router.push('/login' as any)}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022c22', // emerald-950
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    backgroundColor: '#064e3b', // emerald-900
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  title: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6ee7b7', // emerald-300
    fontSize: 16,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: '#fca5a5', // red-300
    textAlign: 'center',
    fontSize: 14,
  },
  inputWrapper: {
    backgroundColor: 'rgba(6, 78, 59, 0.5)',
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#065f46', // emerald-800
  },
  input: {
    flex: 1,
    marginLeft: theme.spacing.md,
    color: theme.colors.white,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  signupButtonText: {
    color: '#022c22',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#6ee7b7',
    fontSize: 14,
  },
  loginLinkTextBold: {
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
});
