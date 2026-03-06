import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const features = [
    t('about.feature1'),
    t('about.feature2'),
    t('about.feature3'),
    t('about.feature4'),
  ];

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header with Safe Area */}
      <View style={styles.headerWrapper}>
        <SafeAreaView edges={['top']} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('about.title')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <BookOpen size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>{t('about.appName')}</Text>
          <Text style={styles.version}>{t('about.version')}</Text>
          <Text style={styles.tagline}>{t('about.description')}</Text>
        </View>

        {/* Mission */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('about.mission')}</Text>
          <Text style={styles.cardText}>{t('about.missionText')}</Text>
        </View>

        {/* Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('about.features')}</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <CheckCircle size={18} color={colors.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Legal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('about.legal')}</Text>
          <Text style={styles.cardText}>{t('about.legalText')}</Text>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>{t('about.copyright')}</Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    headerWrapper: {
      backgroundColor: '#006a4e',
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
    },

    // Hero
    hero: {
      backgroundColor: colors.primary,
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    appName: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: 1,
    },
    version: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 14,
      marginTop: 4,
    },
    tagline: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 20,
    },

    // Cards
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    cardText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },

    // Features
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    featureText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },

    // Copyright
    copyright: {
      textAlign: 'center',
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: 12,
    },
  });

