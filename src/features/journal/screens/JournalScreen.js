import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card, Input, Button } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';
import { getToday, formatDate } from '../../../shared/utils';
import reflectionService from '../services/reflectionService';
import useProfileStore from '../../../core/store/useProfileStore';

const MOODS = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '🔥', label: 'Motivated' }
];

const JournalScreen = () => {
    const profile = useProfileStore(state => state.profile);
    const [mood, setMood] = useState('');
    const [note, setNote] = useState('');
    const [history, setHistory] = useState([]);

    const load = async () => {
        const entry = await reflectionService.getByDate(getToday());
        if (entry) {
            setMood(entry.mood || '');
            setNote(entry.note || '');
        }
        const hist = await reflectionService.getReflectionHistory();
        setHistory(hist);
    };

    useFocusEffect(useCallback(() => {
        load();
    }, []));

    const save = async () => {
        await reflectionService.upsertByDate(getToday(), mood, note);
        load();
    };

    return (
        <View style={styles.container}>
            <Header title="Reflection" subtitle={getToday()} />
            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.promptQuestion}>How was your day?</Text>

                <View style={styles.moodSelectorContainer}>
                    {MOODS.map(m => (
                        <TouchableOpacity
                            key={m.label}
                            style={[
                                styles.moodCircle,
                                mood === m.label && styles.moodCircleActive
                            ]}
                            onPress={() => setMood(m.label)}
                        >
                            <Text style={styles.moodEmoji}>{m.emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Card style={styles.journalCard}>
                    <Input
                        value={note}
                        onChangeText={setNote}
                        placeholder="Write something about today..."
                        multiline
                        numberOfLines={8}
                        style={styles.journalInput}
                        containerStyle={styles.inputContainer}
                    />

                    <View style={styles.saveContainer}>
                        <Button
                            title="Save"
                            onPress={save}
                            disabled={!mood && !note}
                            style={styles.saveButton}
                        />
                    </View>
                </Card>

                {history.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={styles.historyTitle}>Past Reflections</Text>
                        {history.map(item => {
                            const m = MOODS.find(x => x.label === item.mood);
                            return (
                                <Card key={item.id} style={styles.historyCard}>
                                    <View style={styles.historyHeader}>
                                        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                                        <Text style={styles.historyMood}>{m ? m.emoji : ''}</Text>
                                    </View>
                                    {item.note ? (
                                        <Text style={styles.historyNote}>{item.note}</Text>
                                    ) : null}
                                </Card>
                            )
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: spacing.xl },

    // Prompt & Mood
    promptQuestion: {
        ...typography.h2,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.xl
    },
    moodSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginBottom: spacing.xxl
    },
    moodCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    moodCircleActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: colors.accent
    },
    moodEmoji: {
        fontSize: 32
    },

    // Journal Input
    journalCard: {
        padding: spacing.md,
        borderRadius: 16
    },
    inputContainer: {
        marginBottom: 0,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    journalInput: {
        minHeight: 150,
        textAlignVertical: 'top',
        fontSize: 16,
        paddingTop: spacing.sm
    },
    saveContainer: {
        marginTop: spacing.lg,
        alignItems: 'flex-end'
    },
    saveButton: {
        minWidth: 120
    },

    // History
    historySection: { marginTop: spacing.xxxl },
    historyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    historyCard: { marginBottom: spacing.sm, padding: spacing.md, borderRadius: 12 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    historyDate: { ...typography.bodyBold, color: colors.accent },
    historyMood: { fontSize: 24 },
    historyNote: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 22 }
});

export default JournalScreen;
