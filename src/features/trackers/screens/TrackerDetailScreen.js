import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Card, Button, Input } from '../../../shared/components';
import useTrackerStore from '../store/trackerStore';
import trackerService from '../services/trackerService';
import { colors, typography, spacing } from '../../../core/theme';
import { getToday } from '../../../shared/utils';
import TrackerCharts from './TrackerCharts';

const TrackerDetailScreen = ({ route, navigation }) => {
    const { tracker } = route.params;
    const { deleteTracker, logEntry } = useTrackerStore();
    const [value, setValue] = useState('');
    const [weeklyData, setWeeklyData] = useState([]);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [todayDone, setTodayDone] = useState(false);

    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const loadData = async () => {
        try {
            const [weekly, streakData, today] = await Promise.all([
                trackerService.getWeeklySummary(tracker.id),
                trackerService.getStreak(tracker.id),
                trackerService.getTodayEntry(tracker.id),
            ]);
            setWeeklyData(weekly.days || []);
            setStreak(streakData);
            setTodayDone(!!today);
        } catch (e) {
            console.error('Tracker detail load error:', e);
        }
    };

    const handleCheckIn = async () => {
        const loggedValue = tracker.type === 'boolean' ? 1 : parseFloat(value) || 0;
        await logEntry(tracker.id, getToday(), loggedValue);
        setValue('');
        loadData();
    };

    const handleDelete = () => {
        Alert.alert('Delete Tracker', `Delete "${tracker.name}"? All entries will be lost.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTracker(tracker.id); navigation.goBack(); } },
        ]);
    };

    return (
        <View style={styles.container}>
            <Header title={tracker.name} subtitle={tracker.type === 'numeric' ? `Target: ${tracker.target_value} ${tracker.unit || ''}` : 'Daily check-in'} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Card glow style={styles.streakCard}>
                    <View style={styles.streakRow}>
                        <Text style={styles.streakNum}>{streak.current}</Text>
                        <View style={styles.streakTextCol}>
                            <Text style={styles.streakLabel}>Day Streak</Text>
                            <Text style={styles.streakSub}>{todayDone ? 'Logged today' : 'Not logged today'}</Text>
                            <Text style={styles.streakSub}>Best streak: {streak.longest} days</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={streak.current > 0 ? 'fire' : 'weather-night'}
                            size={30}
                            color={streak.current > 0 ? colors.warning : colors.textMuted}
                        />
                    </View>
                </Card>

                {weeklyData.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>LAST 7 DAYS</Text>
                        <Card>
                            <TrackerCharts data={weeklyData} type={tracker.type} />
                        </Card>
                    </View>
                )}

                {!todayDone && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>TODAY CHECK-IN</Text>
                        <Card>
                            {tracker.type === 'numeric' ? (
                                <Input
                                    label={`VALUE (${tracker.unit || 'units'})`}
                                    value={value}
                                    onChangeText={setValue}
                                    keyboardType="numeric"
                                    placeholder={`Target: ${tracker.target_value}`}
                                />
                            ) : null}
                            <Button title={tracker.type === 'boolean' ? 'Mark Done' : 'Log Value'} onPress={handleCheckIn} />
                        </Card>
                    </View>
                )}

                <View style={styles.deleteRow}>
                    <Button title="Delete Tracker" variant="danger" onPress={handleDelete} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    streakCard: { marginBottom: spacing.lg },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
    streakTextCol: { flex: 1 },
    streakNum: { fontSize: 48, fontWeight: '700', color: colors.accent },
    streakLabel: { ...typography.h3, color: colors.textPrimary },
    streakSub: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
    section: { marginBottom: spacing.lg },
    sectionTitle: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
    deleteRow: { paddingBottom: spacing.xxxl },
});

export default TrackerDetailScreen;
