import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Moon,
  Sun,
  Globe,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  ChevronDown,
  Mail,
  ArrowLeft,
  Camera,
  Check,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { uploadToImgBB } from '../src/services/imageService';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, profile, isAdmin, signOut, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const userEmail = session?.user?.email || 'user@example.com';
  const displayName = profile?.full_name || userEmail.split('@')[0];
  const userInitials = displayName.substring(0, 2).toUpperCase();
  
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'bn' ? 'অনুমতি প্রয়োজন' : 'Permission Required',
        language === 'bn' ? 'গ্যালারি অ্যাক্সেস করার জন্য আপনার অনুমতি প্রয়োজন।' : 'We need permission to access your gallery.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarUri) {
        avatarUrl = await uploadToImgBB(avatarUri);
      }

      const { error } = await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (error) {
        Alert.alert('Error', error);
      } else {
        setIsEditing(false);
        setAvatarUri(null);
        Alert.alert(
          language === 'bn' ? 'সফল' : 'Success',
          language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।' : 'Profile updated successfully.'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      language === 'bn' ? 'সাইন আউট' : 'Sign Out',
      language === 'bn' ? 'আপনি কি সাইন আউট করতে চান?' : 'Are you sure you want to sign out?',
      [
        { text: language === 'bn' ? 'বাতিল' : 'Cancel', style: 'cancel' },
        {
          text: t('nav.signOut'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
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
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          {isEditing ? (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => { setIsEditing(false); setAvatarUri(null); }} style={styles.headerBtn}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={styles.headerBtn} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Check size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>{language === 'bn' ? 'সম্পাদন' : 'Edit'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={isEditing ? handlePickImage : undefined}
            disabled={!isEditing}
          >
            <View style={styles.avatar}>
              {avatarUri || profile?.avatar_url ? (
                <Image 
                  source={{ uri: avatarUri || profile?.avatar_url }} 
                  style={styles.avatarImg} 
                />
              ) : (
                <Text style={styles.avatarText}>{userInitials}</Text>
              )}
              {isEditing && (
                <View style={styles.cameraIcon}>
                  <Camera size={16} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder={language === 'bn' ? 'পুরো নাম' : 'Full Name'}
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoFocus
            />
          ) : (
            <Text style={styles.userName}>{profile?.full_name || t('profile.role.user')}</Text>
          )}
          
          <Text style={styles.userEmail}>{userEmail}</Text>
          <View style={styles.roleBadge}>
            <Shield size={12} color={colors.primary} />
            <Text style={styles.roleText}>
              {isAdmin ? t('profile.role.admin') : t('profile.role.user')}
            </Text>
          </View>
          {memberSince ? (
            <Text style={styles.memberSince}>
              {t('profile.memberSince')} {memberSince}
            </Text>
          ) : null}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              {isDarkMode ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.darkMode')}</Text>
              <Text style={styles.settingDesc}>{t('settings.darkModeDesc')}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? colors.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <Text style={[styles.settingDesc, { paddingHorizontal: 16, marginBottom: 12 }]}>
            {t('settings.languageDesc')}
          </Text>
          <View style={styles.languageRow}>
            <TouchableOpacity
              onPress={() => setLanguage('en')}
              style={[
                styles.languageBtn,
                language === 'en' && styles.languageBtnActive,
              ]}
            >
              <Globe size={16} color={language === 'en' ? '#fff' : colors.textSecondary} />
              <Text
                style={[
                  styles.languageBtnText,
                  language === 'en' && styles.languageBtnTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLanguage('bn')}
              style={[
                styles.languageBtn,
                language === 'bn' && styles.languageBtnActive,
              ]}
            >
              <Globe size={16} color={language === 'bn' ? '#fff' : colors.textSecondary} />
              <Text
                style={[
                  styles.languageBtnText,
                  language === 'bn' && styles.languageBtnTextActive,
                ]}
              >
                বাংলা
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Panel - only for admins */}
        {isAdmin && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/admin' as any)}
            >
              <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
                <Shield size={20} color="#d97706" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('nav.adminPanel')}</Text>
                <Text style={styles.settingDesc}>{t('nav.adminPanelDesc')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('nav.faq')}</Text>
          {faqItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <HelpCircle size={18} color={colors.primary} />
                <Text style={styles.faqQuestionText}>{item.q}</Text>
                {expandedFaq === index ? (
                  <ChevronDown size={18} color={colors.textTertiary} />
                ) : (
                  <ChevronRight size={18} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.a}</Text>
                </View>
              )}
              {index < faqItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('nav.support')}</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Linking.openURL('mailto:support@lextaxbd.com')}
          >
            <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
              <Mail size={20} color="#2563eb" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('support.email')}</Text>
              <Text style={styles.settingDesc}>{t('support.emailValue')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <Text style={styles.supportNote}>{t('support.responseTime')}</Text>
        </View>

        {/* About Us */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/about' as any)}
          >
            <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight }]}>
              <Info size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('nav.aboutUs')}</Text>
              <Text style={styles.settingDesc}>{t('nav.aboutUsDesc')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.signOutText}>{t('nav.signOut')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    headerActions: {
      flexDirection: 'row',
      gap: 16,
    },
    headerBtn: {
      padding: 4,
    },
    editBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    editBtnText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },

    // User card
    userCard: {
      backgroundColor: colors.primary,
      paddingVertical: 32,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    avatarContainer: {
      marginBottom: 12,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.4)',
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '700',
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    userName: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    nameInput: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.5)',
      paddingVertical: 4,
      paddingHorizontal: 8,
      textAlign: 'center',
      minWidth: 200,
    },
    userEmail: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 12,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    roleText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    memberSince: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 12,
      marginTop: 8,
    },

    // Sections
    section: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },

    // Setting rows
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    settingDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },

    // Language
    languageRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 10,
    },
    languageBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
    },
    languageBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    languageBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    languageBtnTextActive: {
      color: '#fff',
    },

    // FAQ
    faqQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 10,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    faqAnswer: {
      paddingHorizontal: 16,
      paddingBottom: 14,
      paddingLeft: 46,
    },
    faqAnswerText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 46,
    },

    // Support
    supportNote: {
      fontSize: 12,
      color: colors.textTertiary,
      paddingHorizontal: 16,
      paddingBottom: 14,
      fontStyle: 'italic',
    },

    // Sign out
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#ef4444',
      marginHorizontal: 16,
      marginTop: 8,
      paddingVertical: 14,
      borderRadius: 14,
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    signOutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  });
