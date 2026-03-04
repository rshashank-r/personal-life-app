import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import analyticsService from '../services/analyticsService';
import useProfileStore from '../../../core/store/useProfileStore';

const YearlyReportScreen = () => {
    const profile = useProfileStore(state => state.profile);
    const [insights, setInsights] = useState(null);
    const currentYear = new Date().getFullYear();

    useFocusEffect(useCallback(() => {
        (async () => {
            const data = await analyticsService.getYearlyInsights(currentYear);
            setInsights(data);
        })();
    }, [currentYear]));

    if (!insights) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <Header title="Yearly Report" subtitle={profile?.name ? `${profile.name}'s ${currentYear}` : currentYear.toString()} back />
            <ScrollView contentContainerStyle={styles.content}>

                <Card glow style={styles.heroCard}>
                    <Text style={styles.heroTitle}>{insights.tasksCompleted}</Text>
                    <Text style={styles.heroSub}>Tasks Completed</Text>
                </Card>

                <View style={styles.gridRow}>
                    <Card style={styles.gridCard}>
                        <Text style={styles.statLabel}>Habits Success</Text>
                        <Text style={styles.statValue}>{insights.habitsSuccessRate}%</Text>
                    </Card>
                    <Card style={styles.gridCard}>
                        <Text style={styles.statLabel}>Memories</Text>
                        <Text style={styles.statValue}>{insights.memoriesRecorded}</Text>
                    </Card>
                </View>

                <Card style={styles.bestMonthCard}>
                    <Text style={styles.statLabel}>Top Productive Month</Text>
                    <Text style={[styles.statValue, { color: colors.warning, marginTop: spacing.sm }]}>
                        {insights.topProductiveMonth}
                    </Text>
                </Card>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    heroCard: { alignItems: 'center', paddingVertical: spacing.xxl },
    heroTitle: { ...typography.h1, fontSize: 48, color: colors.accent },
    heroSub: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
    gridRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    gridCard: { flex: 1, padding: spacing.lg, alignItems: 'center' },
    statLabel: { ...typography.caption, color: colors.textSecondary },
    statValue: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.sm },
    bestMonthCard: { marginTop: spacing.md, padding: spacing.lg, alignItems: 'center' }
});

export default YearlyReportScreen;
