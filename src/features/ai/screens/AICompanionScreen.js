import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Card } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import aiService from '../../../core/services/aiService';

const AICompanionScreen = () => {
    const [insights, setInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const loadInsights = async () => {
        setLoadingInsights(true);
        try {
            const data = await aiService.generateLifeInsights();
            setInsights(data);
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
            // Optionally, remove the user message if it failed
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Personal AI" back />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Card style={styles.headerCard}>
                        <MaterialCommunityIcons name="robot-outline" size={32} color={colors.accent} />
                        <Text style={styles.headerTitle}>Context-Aware AI</Text>
                        <Text style={styles.headerSub}>Analyzes your habits, tasks, and memories to provide actionable insights.</Text>
                    </Card>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>LIFE INSIGHTS</Text>
                            <TouchableOpacity onPress={loadInsights} disabled={loadingInsights}>
                                <MaterialCommunityIcons name="refresh" size={20} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                        <Card glow style={styles.insightsCard}>
                            {loadingInsights ? (
                                <View style={styles.loadingBox}>
                                    <ActivityIndicator color={colors.accent} />
                                    <Text style={styles.loadingText}>Analyzing your life data...</Text>
                                </View>
                            ) : insights ? (
                                <Text style={styles.insightText}>{insights}</Text>
                            ) : (
                                <TouchableOpacity style={styles.btnAction} onPress={loadInsights}>
                                    <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.surface} />
                                    <Text style={styles.btnActionText}>Generate Daily Insights</Text>
                                </TouchableOpacity>
                            )}
                        </Card>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>CHAT WITH AI</Text>
                    {messages.length === 0 && (
                        <Text style={styles.emptyChat}>Ask me anything about your tasks, goals, or schedule.</Text>
                    )}
                    {messages.map((msg, index) => (
                        <View key={index} style={[styles.messageRow, msg.role === 'user' ? styles.msgUser : styles.msgAI]}>
                            {msg.role === 'assistant' && <MaterialCommunityIcons name="robot-outline" size={16} color={colors.accent} style={{ marginRight: 4, marginTop: 4 }} />}
                            <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                                <Text style={styles.msgText}>{msg.content}</Text>
                            </View>
                        </View>
                    ))}
                    {isThinking && (
                        <View style={[styles.messageRow, styles.msgAI]}>
                            <ActivityIndicator color={colors.accent} size="small" />
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask your Personal AI..."
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
                        <MaterialCommunityIcons name="send" size={20} color={colors.background} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    headerCard: { alignItems: 'center', marginBottom: spacing.xl, backgroundColor: 'rgba(52,211,153,0.05)', borderColor: colors.accent },
    headerTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.sm },
    headerSub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
    section: { marginBottom: spacing.md },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    sectionTitle: { ...typography.label, color: colors.textSecondary },
    insightsCard: { minHeight: 120, justifyContent: 'center' },
    btnAction: { backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: 12, gap: spacing.sm },
    btnActionText: { ...typography.bodyBold, color: colors.background },
    loadingBox: { alignItems: 'center', padding: spacing.lg },
    loadingText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
    insightText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
    emptyChat: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.lg, fontStyle: 'italic' },
    messageRow: { flexDirection: 'row', marginBottom: spacing.sm, maxWidth: '85%' },
    msgUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    msgAI: { alignSelf: 'flex-start' },
    bubble: { padding: spacing.md, borderRadius: 16 },
    bubbleUser: { backgroundColor: colors.surface, borderBottomRightRadius: 4, borderWidth: 1, borderColor: colors.border },
    bubbleAI: { backgroundColor: 'rgba(52,211,153,0.1)', borderBottomLeftRadius: 4 },
    msgText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
    inputContainer: { flexDirection: 'row', padding: spacing.md, paddingBottom: spacing.xxl, backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border, alignItems: 'flex-end', gap: spacing.sm },
    input: { flex: 1, backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: 20, paddingHorizontal: spacing.lg, paddingTop: 12, paddingBottom: 12, minHeight: 44, maxHeight: 120, borderWidth: 1, borderColor: colors.border },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }
});

export default AICompanionScreen;
