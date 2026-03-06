import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo, memo } from 'react';
import { FileText, ChevronRight, BookmarkX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/lib/supabase';
import { LegalDocument } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';

const BOOKMARKS_KEY = 'lextax_bookmarks';

const BookmarkItem = memo(({ item, onPress, colors, styles }: { item: LegalDocument; onPress: (id: string) => void; colors: any; styles: any }) => (
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
        <Text style={styles.typeBadge}>{item.type}</Text>
        <Text style={styles.yearText}>Year: {item.year}</Text>
      </View>
      <Text style={styles.branchText}>{item.branch}</Text>
    </View>
    <ChevronRight size={20} color={colors.textTertiary} />
  </TouchableOpacity>
));

export default function BookmarksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [docs, setDocs] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const ids: string[] = stored ? JSON.parse(stored) : [];

      if (ids.length === 0) {
        setDocs([]);
        return;
      }

      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .in('id', ids);

      if (error) throw error;
      setDocs((data as LegalDocument[]) ?? []);
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-load every time the tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks])
  );

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = useCallback((id: string) => {
    router.push(`/document/${id}` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: LegalDocument }) => (
    <BookmarkItem 
      item={item} 
      onPress={handlePress} 
      colors={colors} 
      styles={styles} 
    />
  ), [handlePress, colors, styles]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading && docs.length === 0 ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={docs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={docs.length === 0 ? styles.emptyList : styles.listContent}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(_, index) => (
            { length: 110, offset: 110 * index, index }
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookmarkX size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
              <Text style={styles.emptyText}>
                Tap the bookmark icon on any document to save it here for quick access.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadBookmarks}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centeredContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingVertical: 12,
      paddingBottom: 20,
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: colors.cardBg,
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
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
    branchText: {
      color: colors.textTertiary,
      fontSize: 11,
      marginTop: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 24,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
  });

