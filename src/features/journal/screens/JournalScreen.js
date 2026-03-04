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
            <Header title="Daily Reflection" subtitle={getToday()} />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.promptText}>Hey {profile?.name || ''},</Text>
                <Text style={styles.promptSub}>How was your day today?</Text>

                <Card style={styles.inputCard}>
                    <Text style={styles.label}>Mood</Text>
                    <View style={styles.moodRow}>
                        {MOODS.map(m => (
                            <TouchableOpacity
                                key={m.label}
                                style={[styles.moodBtn, mood === m.label && styles.moodActive]}
                                onPress={() => setMood(m.label)}
                            >
                                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                                <Text style={styles.moodLabel}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: spacing.md }]}>Note</Text>
                    <Input
                        value={note}
                        onChangeText={setNote}
                        placeholder="Today I completed my ML assignment..."
                        multiline
                    />

                    <View style={{ marginTop: spacing.md }}>
                        <Button title="Save Reflection" onPress={save} disabled={!mood && !note} />
                    </View>
                </Card>

                {history.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={styles.historyTitle}>Reflection History</Text>
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
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: spacing.md },
    promptText: { ...typography.h2, color: colors.textPrimary },
    promptSub: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
    inputCard: { padding: spacing.lg },
    label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
    moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    moodBtn: { alignItems: 'center', padding: spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: colors.border, flex: 1, marginHorizontal: 4 },
    moodActive: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: colors.accent },
    moodEmoji: { fontSize: 24, marginBottom: 4 },
    moodLabel: { ...typography.caption, color: colors.textSecondary },
    historySection: { marginTop: spacing.xxl },
    historyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    historyCard: { marginBottom: spacing.sm, padding: spacing.md },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    historyDate: { ...typography.bodyBold, color: colors.accent },
    historyMood: { fontSize: 20 },
    historyNote: { ...typography.body, color: colors.textPrimary, marginTop: spacing.xs }
});

export default JournalScreen;
