import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Users, FileText, Shield, ShieldOff, Pencil, Trash2, Plus, ArrowLeft, Search, X } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Profile, LegalDocument } from '../../src/types';
import { theme } from '../../src/theme';

type Tab = 'users' | 'documents';

export default function AdminPanel() {
  const { colors, isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { profile: currentProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)/income-tax' as any);
      return;
    }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchDocuments()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchDocuments()]);
    setRefreshing(false);
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (!error && data) setUsers(data as Profile[]);
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setDocuments(data as LegalDocument[]);
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = !selectedBranch || doc.branch === selectedBranch;
      const matchesType = !selectedType || doc.type === selectedType;
      const matchesYear = !selectedYear || doc.year === selectedYear;
      return matchesSearch && matchesBranch && matchesType && matchesYear;
    });
  }, [documents, searchQuery, selectedBranch, selectedType, selectedYear]);

  const uniqueBranches = useMemo(() => Array.from(new Set(documents.map(d => d.branch))).sort(), [documents]);
  const uniqueTypes = useMemo(() => Array.from(new Set(documents.map(d => d.type))).sort(), [documents]);
  const uniqueYears = useMemo(() => Array.from(new Set(documents.map(d => d.year))).sort((a, b) => b - a), [documents]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBranch(null);
    setSelectedType(null);
    setSelectedYear(null);
  };

  const toggleRole = async (user: Profile) => {
    if (user.id === currentProfile?.id) {
      Alert.alert('Error', 'You cannot change your own role.');
      return;
    }
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Confirm Role Change',
      `Make ${user.email} ${newRole === 'admin' ? 'an Admin' : 'a regular User'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const { error } = await supabase
              .from('profiles')
              .update({ role: newRole })
              .eq('id', user.id);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              fetchUsers();
              queryClient.invalidateQueries({ queryKey: ['legal-docs'] });
            }
          },
        },
      ]
    );
  };

  const deleteDocument = (docId: string, title: string) => {
    Alert.alert('Delete Document', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('legal_documents').delete().eq('id', docId);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            fetchDocuments();
            queryClient.invalidateQueries({ queryKey: ['legal-docs'] });
          }
        },
      },
    ]);
  };

  const renderUserItem = ({ item }: { item: Profile }) => (
    <View style={styles.userCard}>
      <View style={styles.userContent}>
        <Text style={styles.userEmail} numberOfLines={1}>
          {item.email}
        </Text>
        <View style={styles.userTagRow}>
          <View
            style={[
              styles.roleBadge,
              item.role === 'admin' ? styles.adminBadge : styles.userBadge
            ]}
          >
            <Text
              style={[
                styles.roleText,
                item.role === 'admin' ? styles.adminText : styles.userText
              ]}
            >
              {item.role.toUpperCase()}
            </Text>
          </View>
          {item.id === currentProfile?.id && (
            <Text style={styles.selfTag}>You</Text>
          )}
        </View>
      </View>
      {item.id !== currentProfile?.id && (
        <TouchableOpacity
          onPress={() => toggleRole(item)}
          style={[
            styles.actionButton,
            item.role === 'admin' ? styles.demoteButton : styles.promoteButton
          ]}
        >
          {item.role === 'admin' ? (
            <ShieldOff size={20} color={theme.colors.error} />
          ) : (
            <Shield size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = getStyles(colors, isDarkMode);

  const renderDocItem = ({ item }: { item: LegalDocument }) => (
    <View style={styles.docCard}>
      <View style={styles.docHeader}>
        <View style={styles.docContent}>
          <Text style={styles.docTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.docMeta}>
            <Text style={styles.branchBadge}>
              {item.branch}
            </Text>
            <Text style={styles.docInfo}>{item.type} • {item.year}</Text>
          </View>
        </View>
        <View style={styles.docActions}>
          <TouchableOpacity
            onPress={() => router.push(`/admin/document-form?id=${item.id}` as any)}
            style={styles.editButton}
          >
            <Pencil size={18} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteDocument(item.id, item.title)}
            style={styles.deleteButton}
          >
            <Trash2 size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header with Safe Area Background */}
      <View style={styles.headerWrapper}>
        <SafeAreaView edges={['top']} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('users')}
          style={[
            styles.tabItem,
            styles.tabItemLeft,
            activeTab === 'users' ? styles.activeTab : styles.inactiveTab
          ]}
        >
          <Users size={18} color={activeTab === 'users' ? colors.accent : colors.textTertiary} />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'users' ? styles.activeTabLabel : styles.inactiveTabLabel
            ]}
          >
            Users ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('documents')}
          style={[
            styles.tabItem,
            activeTab === 'documents' ? styles.activeTab : styles.inactiveTab
          ]}
        >
          <FileText size={18} color={activeTab === 'documents' ? colors.accent : colors.textTertiary} />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'documents' ? styles.activeTabLabel : styles.inactiveTabLabel
            ]}
          >
            Docs ({documents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'users' ? (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      ) : (
        <>
          {/* Add Document FAB */}
          <TouchableOpacity
            onPress={() => router.push('/admin/document-form' as any)}
            style={styles.fab}
          >
            <Plus size={28} color={isDarkMode ? colors.surface : colors.primaryDark} />
          </TouchableOpacity>

          <View style={styles.filterContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search documents..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textTertiary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                onPress={clearFilters}
                style={[styles.filterChip, (!selectedBranch && !selectedType && !selectedYear && !searchQuery) && styles.activeFilterChip]}
              >
                <Text style={[styles.filterChipText, (!selectedBranch && !selectedType && !selectedYear && !searchQuery) && styles.activeFilterChipText]}>
                  All
                </Text>
              </TouchableOpacity>

              {/* Branch Filters */}
              {uniqueBranches.map(branch => (
                <TouchableOpacity
                  key={`branch-${branch}`}
                  onPress={() => setSelectedBranch(selectedBranch === branch ? null : branch)}
                  style={[styles.filterChip, selectedBranch === branch && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, selectedBranch === branch && styles.activeFilterChipText]}>
                    {branch}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Type Filters */}
              {uniqueTypes.map(type => (
                <TouchableOpacity
                  key={`type-${type}`}
                  onPress={() => setSelectedType(selectedType === type ? null : type)}
                  style={[styles.filterChip, selectedType === type && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, selectedType === type && styles.activeFilterChipText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Year Filters */}
              {uniqueYears.map(year => (
                <TouchableOpacity
                  key={`year-${year}`}
                  onPress={() => setSelectedYear(selectedYear === year ? null : year)}
                  style={[styles.filterChip, selectedYear === year && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, selectedYear === year && styles.activeFilterChipText]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredDocuments}
            renderItem={renderDocItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContainer, { paddingBottom: 80 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{searchQuery || selectedBranch || selectedType || selectedYear ? 'No matching documents found' : 'No documents found'}</Text>
                {(searchQuery || selectedBranch || selectedType || selectedYear) && (
                  <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear All Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </>
      )}
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
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    color: colors.headerText,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  tabsBar: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  tabItemLeft: {
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  inactiveTab: {
    backgroundColor: colors.surfaceSecondary,
  },
  tabLabel: {
    marginLeft: theme.spacing.sm,
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 20,
  },
  activeTabLabel: {
    color: colors.headerText,
  },
  inactiveTabLabel: {
    color: colors.textSecondary,
  },
  listContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  userCard: {
    backgroundColor: colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginVertical: 6,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  userEmail: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 2,
  },
  userTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  adminBadge: {
    backgroundColor: isDarkMode ? colors.surfaceSecondary : '#fef3c7', // amber-100 logic
  },
  userBadge: {
    backgroundColor: colors.surfaceSecondary,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  adminText: {
    color: isDarkMode ? colors.accent : '#92400e', // amber-800 logic
  },
  userText: {
    color: colors.textSecondary,
  },
  selfTag: {
    color: colors.primary,
    fontSize: 12,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  actionButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  demoteButton: {
    backgroundColor: colors.errorLight,
  },
  promoteButton: {
    backgroundColor: colors.primaryLight,
  },
  docCard: {
    backgroundColor: colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginVertical: 6,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  docContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  docTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 2,
  },
  docMeta: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  branchBadge: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 14,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  docInfo: {
    color: colors.textTertiary,
    fontSize: 10,
    lineHeight: 14,
    marginLeft: theme.spacing.md,
  },
  docActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: isDarkMode ? colors.surfaceSecondary : '#eff6ff', // blue-50
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  deleteButton: {
    backgroundColor: colors.errorLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 10,
    backgroundColor: colors.accent,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: colors.text,
    fontSize: 14,
  },
  filterScroll: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: colors.headerText,
  },
  clearButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  clearButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
