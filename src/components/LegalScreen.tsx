import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo, useCallback, memo } from 'react';
import { Search, FileText, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTaxDocs } from '../hooks/useTaxDocs';
import { Branch, DOC_TYPE_MAPPING, HierarchyCategory } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LegalScreenProps {
  branch: Branch;
}

const categories: HierarchyCategory[] = ['Primary Laws', 'Delegated', 'Administrative'];

const DocItem = memo(({ item, onPress, colors, styles }: { item: any; onPress: (id: string) => void; colors: any; styles: any }) => (
  <TouchableOpacity
    onPress={() => onPress(item.id)}
    style={styles.card}
  >
    <View style={styles.iconContainer}>
      <FileText size={24} color={colors.primary} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={styles.typeBadge}>
          {item.type}
        </Text>
        <Text style={styles.yearText}>Year: {item.year}</Text>
      </View>
    </View>
    <ChevronRight size={20} color={colors.textTertiary} />
  </TouchableOpacity>
));

export const LegalScreen = ({ branch }: LegalScreenProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState<HierarchyCategory>('Primary Laws');
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedTypes = useMemo(() => DOC_TYPE_MAPPING[activeCategory], [activeCategory]);
  
  const { data, isLoading, isRefetching, refetch } = useTaxDocs(branch, selectedTypes, searchQuery);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = useCallback((id: string) => {
    router.push(`/document/${id}` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <DocItem 
      item={item} 
      onPress={handlePress} 
      colors={colors} 
      styles={styles} 
    />
  ), [handlePress, colors, styles]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search documents, sections..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Segmented Control / Tabs */}
      <View style={styles.tabsContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.tab,
              activeCategory === cat ? styles.activeTab : styles.inactiveTab
            ]}
          >
            <Text style={[
              styles.tabText,
              activeCategory === cat ? styles.activeTabText : styles.inactiveTabText
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        windowSize={5}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => (
          { length: 94, offset: 94 * index, index }
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No documents found</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      />

      {isLoading && !data && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 8,
    },
    tabsContainer: {
      flexDirection: 'row',
      padding: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
      marginRight: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: '#D4AF37',
    },
    inactiveTab: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabText: {
      fontSize: 12,
      fontWeight: 'bold',
      lineHeight: 18,
      paddingVertical: 2,
    },
    activeTabText: {
      color: '#fff',
    },
    inactiveTabText: {
      color: colors.textSecondary,
    },
    listContent: {
      paddingBottom: 20,
    },
    card: {
      backgroundColor: colors.cardBg,
      marginHorizontal: 16,
      marginVertical: 8, // 16px total vertical margin
      padding: 16,
      borderRadius: 12,
      height: 78, // Fixed height (110 total including margins)
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    iconContainer: {
      backgroundColor: colors.primaryLight,
      padding: 12,
      borderRadius: 9999,
      marginRight: 16,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 24,
      paddingTop: 2,
    },
    cardMeta: {
      flexDirection: 'row',
      marginTop: 4,
      alignItems: 'center',
    },
    typeBadge: {
      color: colors.primary,
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 18,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 4,
    },
    yearText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginLeft: 12,
    },
    emptyContainer: {
      marginTop: 80,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
  });

