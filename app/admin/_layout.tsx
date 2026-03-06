import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '700' },
      }}
    />
  );
}
