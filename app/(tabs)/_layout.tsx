import { Tabs, useRouter } from 'expo-router';
import { Landmark, ReceiptText, ShieldCheck, User, Bookmark } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const { loading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerStyle: {
          backgroundColor: colors.headerBg,
        },
        headerTintColor: colors.headerText,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          backgroundColor: colors.tabBarBg,
        },
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push('/profile' as any)} style={{ marginRight: 16 }}>
            <User size={22} color={colors.headerText} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="income-tax"
        options={{
          title: 'Income Tax',
          tabBarIcon: ({ color, size }) => <Landmark size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vat"
        options={{
          title: 'VAT',
          tabBarIcon: ({ color, size }) => <ReceiptText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customs"
        options={{
          title: 'Customs',
          tabBarIcon: ({ color, size }) => <ShieldCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
