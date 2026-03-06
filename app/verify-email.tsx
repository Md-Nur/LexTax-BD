import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, RefreshCw, LogOut } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { theme } from '../src/theme';
import { supabase } from '../src/lib/supabase';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { session, signOut, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      // Fetch fresh session to check email_confirmed_at
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      
      if (freshSession?.user?.email_confirmed_at) {
        await refreshProfile();
        router.replace('/(tabs)/income-tax' as any);
      } else {
        Alert.alert(
          'Not Verified Yet',
          'We couldn\'t verify your email yet. Please make sure you clicked the link in the email we sent to ' + session?.user?.email
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while checking your status.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login' as any);
  };

  const handleResendEmail = async () => {
    if (!session?.user?.email) return;
    
    setChecking(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: session.user.email,
    });
    setChecking(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Email Sent', 'A verification email has been resent to ' + session.user.email);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={60} color={theme.colors.accent} />
        </View>
        
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to:{"\n"}
          <Text style={styles.emailText}>{session?.user?.email}</Text>
        </Text>
        
        <Text style={styles.description}>
          Please click the link in that email to verify your account and access the LexTax BD portal.
        </Text>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleCheckStatus}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={theme.colors.primaryDark} />
          ) : (
            <>
              <RefreshCw size={20} color={theme.colors.primaryDark} style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleResendEmail}
          disabled={checking}
        >
          <Text style={styles.secondaryButtonText}>Resend Verification Email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <LogOut size={18} color="#6ee7b7" style={{ marginRight: 8 }} />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022c22', // emerald-950
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#064e3b',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xxl,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  title: {
    color: theme.colors.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6ee7b7',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  emailText: {
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  description: {
    color: theme.colors.gray300,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  primaryButtonText: {
    color: '#022c22',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  secondaryButtonText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: theme.spacing.xl,
  },
  signOutButtonText: {
    color: '#6ee7b7',
    fontSize: 14,
    fontWeight: '600',
  },
});
