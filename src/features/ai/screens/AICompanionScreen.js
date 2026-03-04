import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Bot, RefreshCw, Lightbulb, MessageSquare, ArrowUp } from 'lucide-react-native';
import { Header, Card, Button } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import aiService from '../../../core/services/aiService';

// Clean raw AI response — strip JSON wrappers, code fences, etc.
const cleanAIResponse = (raw) => {
    if (!raw || typeof raw !== 'string') return '';
    let text = raw.trim();

    // Try to parse as JSON and extract content
    try {
        const parsed = JSON.parse(text);
        if (typeof parsed === 'string') return parsed;
        if (parsed.content) return String(parsed.content);
        if (parsed.message) return String(parsed.message);
        if (parsed.text) return String(parsed.text);
        if (parsed.choices?.[0]?.message?.content) return String(parsed.choices[0].message.content);
        // If it's an object we can't extract from, stringify nicely
        return JSON.stringify(parsed, null, 2);
    } catch {
        // Not JSON — continue processing
    }

    // Strip markdown code fences wrapping JSON
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    // Try parsing again after stripping fences
    try {
        const parsed = JSON.parse(text);
        if (typeof parsed === 'string') return parsed;
        if (parsed.content) return String(parsed.content);
        if (parsed.message) return String(parsed.message);
        if (parsed.response) return String(parsed.response);
        return JSON.stringify(parsed, null, 2);
    } catch {
        // Not JSON — it's plain text/markdown, return as-is
    }

    return text;
};

// Render markdown-like text into styled components
const RenderFormattedText = ({ text }) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={idx} style={{ height: 8 }} />;

        // Headers
        if (trimmed.startsWith('### ')) {
            return <Text key={idx} style={styles.mdH3}>{trimmed.slice(4)}</Text>;
        }
        if (trimmed.startsWith('## ')) {
            return <Text key={idx} style={styles.mdH2}>{trimmed.slice(3)}</Text>;
        }
        if (trimmed.startsWith('# ')) {
            return <Text key={idx} style={styles.mdH1}>{trimmed.slice(2)}</Text>;
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
            const bulletText = trimmed.replace(/^[-*]\s|^\d+\.\s/, '');
            return (
                <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{renderInlineFormatting(bulletText)}</Text>
                </View>
            );
        }

        // Regular paragraph
        return <Text key={idx} style={styles.mdParagraph}>{renderInlineFormatting(trimmed)}</Text>;
    });
};

// Handle bold (**text**) and italic (*text*)
const renderInlineFormatting = (text) => {
    if (!text) return text;

    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        // Bold: **text**
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch) {
            const before = remaining.slice(0, boldMatch.index);
            if (before) parts.push(<Text key={key++}>{before}</Text>);
            parts.push(<Text key={key++} style={{ fontWeight: '700', color: colors.accent }}>{boldMatch[1]}</Text>);
            remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
            continue;
        }
        // No more formatting
        parts.push(<Text key={key++}>{remaining}</Text>);
        break;
    }

    return parts.length === 1 ? parts[0] : parts;
};

const AICompanionScreen = () => {
    const [insightsRaw, setInsightsRaw] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatScrollRef = useRef(null);

    const loadInsights = async () => {
        setLoadingInsights(true);
        try {
            const data = await aiService.generateLifeInsights();
            setInsightsRaw(data);
        } catch (error) {
            Alert.alert("AI Error", error.message);
        } finally {
            setLoadingInsights(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { role: 'user', content: inputText.trim() };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInputText('');
        setIsThinking(true);

        try {
            const reply = await aiService.chatStream(newHistory);
            setMessages([...newHistory, { role: 'assistant', content: reply }]);
            setTimeout(() => chatScrollRef.current?.scrollToEnd?.({ animated: true }), 100);
        } catch (error) {
            Alert.alert("Chat Error", error.message);
        } finally {
            setIsThinking(false);
        }
    };

    const cleanedInsights = insightsRaw ? cleanAIResponse(insightsRaw) : '';

    return (
        <View style={styles.container}>
            <Header title="AI Insights" back />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* Insights Section */}
                    <View style={styles.insightsSection}>
                        {!insightsRaw && !loadingInsights && (
                            <View style={styles.generateContainer}>
                                <View style={styles.robotIconContainer}>
                                    <Bot size={48} color={colors.accent} />
                                </View>
                                <Text style={styles.generateTitle}>Discover Patterns</Text>
                                <Text style={styles.generateSub}>Let AI analyze your habits and tasks to provide personalized recommendations.</Text>
                                <Button title="Generate insights" onPress={loadInsights} style={styles.generateBtn} />
                            </View>
                        )}

                        {loadingInsights && (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator color={colors.accent} size="large" />
                                <Text style={styles.loadingText}>Analyzing your data...</Text>
                            </View>
                        )}

                        {insightsRaw && !loadingInsights && (
                            <View style={styles.insightsContainer}>
                                <View style={styles.insightsHeader}>
                                    <Text style={styles.sectionTitle}>Your Insights</Text>
                                    <TouchableOpacity onPress={loadInsights}>
                                        <RefreshCw size={24} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                <Card glow style={styles.insightCard}>
                                    <RenderFormattedText text={cleanedInsights} />
                                </Card>
                            </View>
                        )}
                    </View>

                    {/* Chat Assistant Section */}
                    <View style={styles.chatSection}>
                        <Text style={styles.sectionTitle}>Chat Assistant</Text>

                        <Card style={styles.chatContainer}>
                            <ScrollView ref={chatScrollRef} nestedScrollEnabled style={{ maxHeight: 350, minHeight: 200 }}>
                                {messages.length === 0 && (
                                    <View style={styles.emptyChatContainer}>
                                        <MessageSquare size={32} color={colors.textMuted} />
                                        <Text style={styles.emptyChat}>Ask me anything about your tasks, goals, or schedule.</Text>
                                    </View>
                                )}
                                {messages.map((msg, index) => (
                                    <View key={index} style={[styles.messageRow, msg.role === 'user' ? styles.msgUser : styles.msgAI]}>
                                        {msg.role === 'assistant' && (
                                            <Bot size={20} color={colors.accent} style={styles.chatIcon} />
                                        )}
                                        <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                                            {msg.role === 'assistant' ? (
                                                <RenderFormattedText text={cleanAIResponse(msg.content)} />
                                            ) : (
                                                <Text style={[styles.msgText, { color: colors.background }]}>{msg.content}</Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                                {isThinking && (
                                    <View style={[styles.messageRow, styles.msgAI]}>
                                        <Bot size={20} color={colors.accent} style={styles.chatIcon} />
                                        <View style={[styles.bubble, styles.bubbleAI, { paddingHorizontal: 16 }]}>
                                            <ActivityIndicator color={colors.accent} size="small" />
                                        </View>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Message AI..."
                                    placeholderTextColor={colors.textMuted}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    editable={!isThinking}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[styles.sendBtn, (!inputText.trim() || isThinking) && { opacity: 0.5 }]}
                                    onPress={handleSend}
                                    disabled={!inputText.trim() || isThinking}
                                >
                                    <ArrowUp size={20} color={colors.surface} />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },

    // Generate Insights Intro
    insightsSection: { marginBottom: spacing.xxl },
    generateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        marginTop: spacing.md
    },
    robotIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md
    },
    generateTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
    generateSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
    generateBtn: { paddingHorizontal: spacing.xxl },

    loadingBox: { alignItems: 'center', paddingVertical: spacing.xxxl },
    loadingText: { ...typography.label, color: colors.textSecondary, marginTop: spacing.md },

    // Insight Cards
    insightsContainer: { marginTop: spacing.sm },
    insightsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    insightCard: { padding: spacing.lg, borderRadius: 16 },

    // Markdown rendering
    mdH1: { ...typography.h2, color: colors.accent, marginBottom: spacing.sm, marginTop: spacing.xs },
    mdH2: { ...typography.h3, color: colors.accent, marginBottom: spacing.sm, marginTop: spacing.xs },
    mdH3: { ...typography.bodyBold, color: colors.accent, marginBottom: spacing.xs, marginTop: spacing.xs },
    mdParagraph: { ...typography.body, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.xs },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs, paddingLeft: spacing.sm },
    bulletDot: { color: colors.accent, fontSize: 16, lineHeight: 22, marginRight: spacing.sm, fontWeight: '700' },
    bulletText: { ...typography.body, color: colors.textPrimary, lineHeight: 22, flex: 1 },

    // Chat Section
    chatSection: { marginBottom: spacing.xl },
    chatContainer: { padding: spacing.sm, borderRadius: 20 },
    emptyChatContainer: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
    emptyChat: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },

    messageRow: { flexDirection: 'row', marginBottom: spacing.md, maxWidth: '90%', alignItems: 'flex-start' },
    msgUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    msgAI: { alignSelf: 'flex-start' },
    chatIcon: { marginRight: spacing.sm, marginTop: 10 },
    bubble: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, maxWidth: '100%' },
    bubbleUser: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
    bubbleAI: { backgroundColor: 'rgba(52,211,153,0.1)', borderBottomLeftRadius: 4 },
    msgText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        borderRadius: 24,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.border
    },
    input: { flex: 1, color: colors.textPrimary, paddingHorizontal: spacing.md, minHeight: 40, maxHeight: 100 },
    sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }
});

export default AICompanionScreen;
