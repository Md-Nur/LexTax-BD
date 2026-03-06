import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Save, ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/context/ThemeContext';
import { Branch, DocType, LegalDocument } from '../../src/types';
import { theme } from '../../src/theme';

const BRANCHES: Branch[] = ['Income Tax', 'VAT', 'Customs'];
const DOC_TYPES: DocType[] = ['ACT', 'SRO', 'GO', 'SO', 'Circular'];

export default function DocumentFormScreen() {
  const { colors, isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [branch, setBranch] = useState<Branch>('Income Tax');
  const [type, setType] = useState<DocType>('ACT');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [content, setContent] = useState('');
  const [sectionRef, setSectionRef] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showBranch, setShowBranch] = useState(false);
  const [showType, setShowType] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      const doc = data as LegalDocument;
      setTitle(doc.title);
      setBranch(doc.branch);
      setType(doc.type);
      setYear(doc.year.toString());
      setContent(doc.content);
      setSectionRef(doc.section_reference || '');
      setEffectiveDate(doc.effective_date || '');
    }
    setFetching(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !year.trim()) {
      Alert.alert('Validation Error', 'Title, content, and year are required.');
      return;
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum)) {
      Alert.alert('Validation Error', 'Year must be a valid number.');
      return;
    }

    setLoading(true);

    const docData = {
      title: title.trim(),
      branch,
      type,
      year: yearNum,
      content: content.trim(),
      section_reference: sectionRef.trim() || null,
      effective_date: effectiveDate.trim() || null,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase.from('legal_documents').update(docData).eq('id', id));
    } else {
      ({ error } = await supabase.from('legal_documents').insert(docData));
    }

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ['legal-docs'] });
      Alert.alert('Success', `Document ${isEditing ? 'updated' : 'created'} successfully.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const styles = getStyles(colors, isDarkMode);

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header with Safe Area Background */}
      <View style={styles.headerWrapper}>
        <SafeAreaView edges={['top']} />
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ArrowLeft size={24} color={colors.headerText} />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>
              {isEditing ? 'Edit Document' : 'New Document'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#064e3b" />
            ) : (
              <>
                <Save size={18} color="#064e3b" />
                <Text style={styles.saveButtonText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Document title"
            value={title}
            onChangeText={setTitle}
            multiline
            placeholderTextColor={colors.textTertiary}
          />

          {/* Branch Selector */}
          <Text style={styles.label}>Branch *</Text>
          <TouchableOpacity
            onPress={() => { setShowBranch(!showBranch); setShowType(false); }}
            style={styles.selector}
          >
            <Text style={styles.selectorText}>{branch}</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {showBranch && (
            <View style={styles.dropdown}>
              {BRANCHES.map((b) => (
                <TouchableOpacity
                  key={b}
                  onPress={() => { setBranch(b); setShowBranch(false); }}
                  style={[styles.dropdownItem, branch === b && styles.dropdownItemActive]}
                >
                  <Text style={[styles.dropdownItemText, branch === b && styles.dropdownItemTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Type Selector */}
          <Text style={styles.label}>Type *</Text>
          <TouchableOpacity
            onPress={() => { setShowType(!showType); setShowBranch(false); }}
            style={styles.selector}
          >
            <Text style={styles.selectorText}>{type}</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {showType && (
            <View style={styles.dropdown}>
              {DOC_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => { setType(t); setShowType(false); }}
                  style={[styles.dropdownItem, type === t && styles.dropdownItemActive]}
                >
                  <Text style={[styles.dropdownItemText, type === t && styles.dropdownItemTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Year */}
          <Text style={styles.label}>Year *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2024"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            placeholderTextColor={colors.textTertiary}
          />

          {/* Section Reference */}
          <Text style={styles.label}>Section Reference</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Section 2(46)"
            value={sectionRef}
            onChangeText={setSectionRef}
            placeholderTextColor={colors.textTertiary}
          />

          {/* Effective Date */}
          <Text style={styles.label}>Effective Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={effectiveDate}
            onChangeText={setEffectiveDate}
            placeholderTextColor={colors.textTertiary}
          />

          {/* Content */}
          <Text style={styles.label}>Content (Markdown) *</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Document content in Markdown format..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={12}
            textAlignVertical="top"
            placeholderTextColor={colors.textTertiary}
          />

          <View style={styles.footerSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
      <SafeAreaView edges={['bottom']} />
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerWrapper: {
    backgroundColor: colors.headerBg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    marginRight: theme.spacing.md,
  },
  headerTitleText: {
    color: colors.headerText,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 26,
    paddingVertical: 2,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#064e3b',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  multilineInput: {
    minHeight: 60,
  },
  contentInput: {
    minHeight: 250,
    marginBottom: theme.spacing.xl,
  },
  selector: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  selectorText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 2,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    paddingVertical: 2,
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  footerSpacer: {
    height: 80,
  },
});
