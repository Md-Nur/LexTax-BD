import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../src/lib/supabase";
import { LegalDocument } from "../../src/types";
import Markdown, { ASTNode } from "react-native-markdown-display";
import {
  Bookmark,
  Share as ShareIcon,
  ArrowLeft,
  BookmarkCheck,
  List,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { 
  BannerAd, 
  BannerAdSize, 
  TestIds, 
  InterstitialAd, 
  AdEventType,
  useInterstitialAd
} from 'react-native-google-mobile-ads';
import AdBanner from "../../src/components/AdBanner";

const BOOKMARKS_KEY = "lextax_bookmarks";

const interstitialUnitId = Platform.select({
  android: TestIds.INTERSTITIAL,
  ios: TestIds.INTERSTITIAL,
}) || TestIds.INTERSTITIAL;

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { isDarkMode, colors } = useTheme();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { isLoaded, isClosed, load, show } = useInterstitialAd(interstitialUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isLoaded) {
      show();
    }
  }, [isLoaded]);

  // TOC State
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>(
    [],
  );
  const [showToc, setShowToc] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerPositions = useRef<{ [key: string]: number }>({});
  const [markdownY, setMarkdownY] = useState(0);

  const { data: doc, isLoading } = useQuery({
    queryKey: ["doc", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as LegalDocument;
    },
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
        if (bookmarks) {
          const parsed = JSON.parse(bookmarks);
          setIsBookmarked(parsed.includes(id));
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkStatus();
  }, [id]);

  useEffect(() => {
    if (doc?.content) {
      const headings = [];
      const regex = /^(#{1,6})\s+(.*)$/gm;
      let match;
      while ((match = regex.exec(doc.content)) !== null) {
        const rawText = match[2].trim();
        // Strip common markdown markers for the index ID match
        const cleanText = rawText.replace(/[*_~`]/g, "");
        headings.push({
          id: cleanText,
          text: cleanText,
          level: match[1].length,
        });
      }
      setToc(headings);
      headerPositions.current = {}; // Reset positions on content change
    }
  }, [doc?.content]);

  const toggleBookmark = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      let list = bookmarks ? JSON.parse(bookmarks) : [];
      if (isBookmarked) {
        list = list.filter((bId: string) => bId !== id);
      } else {
        list.push(id);
      }
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      setIsBookmarked(!isBookmarked);
    } catch {
      Alert.alert("Error", "Could not update bookmark");
    }
  };

  const handleShare = async () => {
    if (!doc) return;
    try {
      await Share.share({
        message: `${doc.title}\n\nBranch: ${doc.branch}\nType: ${doc.type}\nYear: ${doc.year}\n\nRead more in LexTax BD.`,
        title: doc.title,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleTocPress = (headingId: string) => {
    setShowToc(false);
    const yPos = headerPositions.current[headingId];
    if (yPos !== undefined && scrollViewRef.current) {
      // scroll to the markdown offset + the heading offset
      scrollViewRef.current.scrollTo({ y: markdownY + yPos, animated: true });
    }
  };

  const styles = createStyles(colors);

  const renderHeading = (
    node: ASTNode,
    children: React.ReactNode[],
    styles: any,
    level: number,
  ) => {
    const getTextContent = (nodes: ASTNode[]): string => {
      return nodes
        .map((n) => {
          if (n.type === "text") return n.content;
          if (n.children && n.children.length > 0)
            return getTextContent(n.children);
          return n.content || "";
        })
        .join("");
    };
    const textContent = getTextContent(node.children).trim();

    return (
      <View
        key={node.key}
        onLayout={(event) => {
          if (textContent) {
            headerPositions.current[textContent] = event.nativeEvent.layout.y;
          }
        }}
      >
        <Text style={styles[`heading${level}`]}>{children}</Text>
      </View>
    );
  };

  const markdownRules = {
    heading1: (
      node: ASTNode,
      children: React.ReactNode[],
      parent: any[],
      styles: any,
    ) => renderHeading(node, children, styles, 1),
    heading2: (
      node: ASTNode,
      children: React.ReactNode[],
      parent: any[],
      styles: any,
    ) => renderHeading(node, children, styles, 2),
    heading3: (
      node: ASTNode,
      children: React.ReactNode[],
      parent: any[],
      styles: any,
    ) => renderHeading(node, children, styles, 3),
    heading4: (
      node: ASTNode,
      children: React.ReactNode[],
      parent: any[],
      styles: any,
    ) => renderHeading(node, children, styles, 4),
    heading5: (
      node: ASTNode,
      children: React.ReactNode[],
      parent: any[],
      styles: any,
    ) => renderHeading(node, children, styles, 5),
    heading6: (
      node: ASTNode,
      children: React.ReactNode[],
      parent: any[],
      styles: any,
    ) => renderHeading(node, children, styles, 6),
  };

  const markdownStyles = {
    body: { color: colors.text, fontSize: 16, lineHeight: 28 },
    heading1: {
      color: colors.primary,
      marginTop: 20,
      marginBottom: 10,
      fontWeight: "700" as const,
      lineHeight: 36,
      paddingVertical: 4,
    },
    heading2: {
      color: colors.primary,
      marginTop: 15,
      marginBottom: 8,
      fontWeight: "700" as const,
      lineHeight: 32,
      paddingVertical: 4,
    },
    heading3: {
      color: colors.primary,
      marginTop: 12,
      marginBottom: 6,
      fontWeight: "700" as const,
      lineHeight: 28,
      paddingVertical: 4,
    },
    heading4: {
      color: colors.primary,
      marginTop: 10,
      marginBottom: 4,
      fontWeight: "700" as const,
      lineHeight: 24,
      paddingVertical: 2,
    },
    heading5: {
      color: colors.primary,
      marginTop: 8,
      marginBottom: 4,
      fontWeight: "700" as const,
      lineHeight: 22,
      paddingVertical: 2,
    },
    heading6: {
      color: colors.primary,
      marginTop: 6,
      marginBottom: 2,
      fontWeight: "700" as const,
      lineHeight: 20,
      paddingVertical: 2,
    },
    table: {
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginVertical: 10,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.border,
      flexDirection: "row" as const,
    },
    th: {
      backgroundColor: colors.surfaceSecondary,
      padding: 8,
      fontWeight: "bold" as const,
    },
    td: { padding: 8, flex: 1 },
    strong: { fontWeight: "bold" as const },
    link: { color: colors.primary, textDecorationLine: "underline" as const },
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Document not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {toc.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowToc(true)}
              style={styles.headerAction}
            >
              <List color={colors.text} size={24} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={toggleBookmark}
            style={styles.headerAction}
          >
            {isBookmarked ? (
              <BookmarkCheck
                color={colors.primary}
                size={24}
                fill={colors.primary}
              />
            ) : (
              <Bookmark color={colors.text} size={24} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <ShareIcon color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <AdBanner />
        <View style={styles.docHeader}>
          <Text style={styles.docMeta}>
            {doc.branch} • {doc.type}
          </Text>
          <Text style={styles.docTitle}>{doc.title}</Text>
          <View style={styles.docTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Year: {doc.year}</Text>
            </View>
            {doc.effective_date && (
              <View style={[styles.tag, { marginLeft: 12 }]}>
                <Text style={styles.tagText}>
                  Effective: {doc.effective_date}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View onLayout={(event) => setMarkdownY(event.nativeEvent.layout.y)}>
          <Markdown style={markdownStyles} rules={markdownRules}>
            {doc.content}
          </Markdown>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* TOC Modal */}
      <Modal
        visible={showToc}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowToc(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowToc(false)}
        >
          <View style={styles.tocContainer}>
            <View style={styles.tocHeader}>
              <Text style={styles.tocTitle}>Table of Contents</Text>
              <TouchableOpacity onPress={() => setShowToc(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tocList}>
              {toc.map((item, index) => (
                <TouchableOpacity
                  key={`${item.id}-${index}`}
                  style={[
                    styles.tocItem,
                    { marginLeft: (item.level - 1) * 16 },
                  ]}
                  onPress={() => handleTocPress(item.id)}
                >
                  <Text style={styles.tocItemText} numberOfLines={2}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      padding: 16,
    },
    errorText: {
      color: colors.textSecondary,
    },
    goBackButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 8,
      borderRadius: 9999,
    },
    goBackButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerActions: {
      flexDirection: "row",
    },
    headerAction: {
      marginRight: 16,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 40,
    },
    docHeader: {
      marginBottom: 24,
    },
    docMeta: {
      color: colors.primary,
      fontWeight: "bold",
      fontSize: 12,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    docTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "bold",
      lineHeight: 36,
      paddingVertical: 4,
    },
    docTags: {
      flexDirection: "row",
      marginTop: 12,
      alignItems: "center",
    },
    tag: {
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 9999,
    },
    tagText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "500",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 24,
    },

    footerSpacer: {
      height: 80,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    tocContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "70%",
      minHeight: "40%",
      padding: 20,
      paddingBottom: 40,
    },
    tocHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
    },
    tocTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    closeBtn: {
      color: colors.primary,
      fontWeight: "600",
    },
    tocList: {
      flexGrow: 0,
    },
    tocItem: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    tocItemText: {
      fontSize: 16,
      color: colors.text,
    },
  });
