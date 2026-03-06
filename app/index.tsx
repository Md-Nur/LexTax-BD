import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { session, loading, isEmailVerified } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#022c22' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (!isEmailVerified) {
    return <Redirect href={"/verify-email" as any} />;
  }

  return <Redirect href="/(tabs)/income-tax" />;
}
