import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Bot, RefreshCw, Lightbulb, MessageSquare, ArrowUp } from 'lucide-react-native';
import { Header, Card, Button } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import aiService from '../../../core/services/aiService';

const AICompanionScreen = () => {
    const [insightsRaw, setInsightsRaw] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);

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
        } catch (error) {
            Alert.alert("Chat Error", error.message);
        } finally {
            setIsThinking(false);
        }
    };

    // Parse insights strings into bullet points or separate sentences
    const insightPoints = insightsRaw
        ? insightsRaw.split(/\n+/).map(s => s.trim()).filter(Boolean)
        : [];

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
                                {insightPoints.length > 0 ? (
                                    insightPoints.map((point, idx) => (
                                        <Card key={`insight-${idx}`} glow style={styles.insightCardItem}>
                                            <Lightbulb size={24} color={colors.warning} style={styles.insightIcon} />
                                            <Text style={styles.insightText}>{point}</Text>
                                        </Card>
                                    ))
                                ) : (
                                    <Card style={styles.insightCardItem}>
                                        <Text style={styles.insightText}>Not enough data to generate insights today.</Text>
                                    </Card>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Chat Assistant Section */}
                    <View style={styles.chatSection}>
                        <Text style={styles.sectionTitle}>Chat Assistant</Text>

                        <Card style={styles.chatContainer}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 300, minHeight: 200 }}>
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
                                            <Text style={[styles.msgText, msg.role === 'user' && { color: colors.background }]}>{msg.content}</Text>
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
    insightCardItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 16
    },
    insightIcon: { marginRight: spacing.md, marginTop: 2 },
    insightText: { ...typography.body, color: colors.textPrimary, flex: 1, lineHeight: 22 },

    // Chat Section
    chatSection: { marginBottom: spacing.xl },
    chatContainer: { padding: spacing.sm, borderRadius: 20 },
    emptyChatContainer: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
    emptyChat: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },

    messageRow: { flexDirection: 'row', marginBottom: spacing.md, maxWidth: '90%', alignItems: 'flex-start' },
    msgUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    msgAI: { alignSelf: 'flex-start' },
    chatIcon: { marginRight: spacing.sm, marginTop: 10 },
    bubble: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20 },
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
