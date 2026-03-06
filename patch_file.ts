import * as fs from 'fs';

let content = fs.readFileSync('app/document/[id].tsx', 'utf8');

content = content.replace("import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, StyleSheet } from 'react-native';", "import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, StyleSheet, Modal } from 'react-native';");

content = content.replace("import { Bookmark, Share as ShareIcon, ArrowLeft, BookmarkCheck } from 'lucide-react-native';", "import { Bookmark, Share as ShareIcon, ArrowLeft, BookmarkCheck, List } from 'lucide-react-native';");

content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect, useRef } from 'react';\nimport { ASTNode } from 'react-native-markdown-display';");

const newStates = `
  const { isDarkMode, colors } = useTheme();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // TOC State
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [showToc, setShowToc] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerPositions = useRef<{ [key: string]: number }>({});
  const [markdownY, setMarkdownY] = useState(0);
`;
content = content.replace("const { isDarkMode, colors } = useTheme();\n  const [isBookmarked, setIsBookmarked] = useState(false);", newStates);


const useEffectContent = `
  useEffect(() => {
    checkBookmarkStatus();
  }, [id]);

  useEffect(() => {
    if (doc?.content) {
      const headings = [];
      const regex = /^(#{1,6})\\s+(.*)$/gm;
      let match;
      while ((match = regex.exec(doc.content)) !== null) {
        headings.push({
          id: match[2].trim(), // Use text as ID for lookup
          text: match[2].trim(),
          level: match[1].length,
        });
      }
      setToc(headings);
    }
  }, [doc?.content]);
`;
content = content.replace("useEffect(() => {\n    checkBookmarkStatus();\n  }, [id]);", useEffectContent);

// Add TOC scrolling handler
const tocHandler = `
  const handleTocPress = (headingId: string) => {
    setShowToc(false);
    const yPos = headerPositions.current[headingId];
    if (yPos !== undefined && scrollViewRef.current) {
      // scroll to the markdown offset + the heading offset
      scrollViewRef.current.scrollTo({ y: markdownY + yPos, animated: true });
    }
  };
`;
content = content.replace("const styles = createStyles(colors);", tocHandler + "\n  const styles = createStyles(colors);");

// Make Custom Header render Rules
const markdownStylesReplace = `
  const renderHeading = (node: ASTNode, children: React.ReactNode[], styles: any, level: number) => {
    const textNode = node.children.find((c) => c.type === 'text');
    const textContent = textNode ? textNode.content : '';
    
    return (
      <View
        key={node.key}
        onLayout={(event) => {
          if (textContent) {
            headerPositions.current[textContent.trim()] = event.nativeEvent.layout.y;
          }
        }}
      >
        <Text style={styles[\`heading\${level}\`]}>
          {children}
        </Text>
      </View>
    );
  };

  const markdownRules = {
    heading1: (node: ASTNode, children: React.ReactNode[], parent: any[], styles: any) => renderHeading(node, children, styles, 1),
    heading2: (node: ASTNode, children: React.ReactNode[], parent: any[], styles: any) => renderHeading(node, children, styles, 2),
    heading3: (node: ASTNode, children: React.ReactNode[], parent: any[], styles: any) => renderHeading(node, children, styles, 3),
    heading4: (node: ASTNode, children: React.ReactNode[], parent: any[], styles: any) => renderHeading(node, children, styles, 4),
    heading5: (node: ASTNode, children: React.ReactNode[], parent: any[], styles: any) => renderHeading(node, children, styles, 5),
    heading6: (node: ASTNode, children: React.ReactNode[], parent: any[], styles: any) => renderHeading(node, children, styles, 6),
  };
`;

content = content.replace("const markdownStyles = {", markdownStylesReplace + "\n  const markdownStyles = {");

const newActions = `
        <View style={styles.headerActions}>
          {toc.length > 0 && (
            <TouchableOpacity onPress={() => setShowToc(true)} style={styles.headerAction}>
              <List color={colors.text} size={24} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={toggleBookmark} style={styles.headerAction}>
`;
content = content.replace("<View style={styles.headerActions}>\n          <TouchableOpacity onPress={toggleBookmark} style={styles.headerAction}>", newActions);

const newScrollView = `
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
`;
content = content.replace("<ScrollView \n        style={styles.scrollView}\n        contentContainerStyle={styles.scrollContent}\n      >", newScrollView);

const newMarkdown = `
        <View style={styles.divider} />

        <View onLayout={(event) => setMarkdownY(event.nativeEvent.layout.y)}>
          <Markdown style={markdownStyles} rules={markdownRules}>
            {doc.content}
          </Markdown>
        </View>
        
        <View style={styles.footerSpacer} />
`;
content = content.replace("<View style={styles.divider} />\n\n        <Markdown style={markdownStyles}>\n          {doc.content}\n        </Markdown>\n        \n        <View style={styles.footerSpacer} />", newMarkdown);

const tocModalAndReturn = `
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
                  key={\`\${item.id}-\${index}\`}
                  style={[styles.tocItem, { marginLeft: (item.level - 1) * 16 }]}
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
`;

content = content.replace("<View style={styles.footerSpacer} />\n      </ScrollView>\n    </SafeAreaView>", tocModalAndReturn);


const newStyles = `
    footerSpacer: {
      height: 80,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    tocContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '70%',
      minHeight: '40%',
      padding: 20,
      paddingBottom: 40,
    },
    tocHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
    },
    tocTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeBtn: {
      color: colors.primary,
      fontWeight: '600',
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
`;
content = content.replace("footerSpacer: {\n      height: 80,\n    },", newStyles);

fs.writeFileSync('app/document/[id].tsx', content, 'utf8');

