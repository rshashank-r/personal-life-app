import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import analyticsService from '../services/analyticsService';
import useProfileStore from '../../../core/store/useProfileStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StatCard = ({ label, value, color, icon }) => (
    <Card style={styles.statCard}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, color && { color }]}>{value ?? '—'}</Text>
    </Card>
);

const YearlyReportScreen = () => {
    const profile = useProfileStore(state => state.profile);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();

    useFocusEffect(useCallback(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await analyticsService.getYearlyInsights(currentYear);
                if (!cancelled) setInsights(data);
            } catch (e) {
                console.error('[YearlyReport]', e);
                if (!cancelled) setError(e.message || 'Failed to load report');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [currentYear]));

    return (
        <View style={styles.container}>
            <Header
                title="Yearly Report"
                subtitle={profile?.name ? `${profile.name}'s ${currentYear}` : currentYear.toString()}
                back
            />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {loading && (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator color={colors.accent} size="large" />
                        <Text style={styles.loadingText}>Generating your yearly report...</Text>
                    </View>
                )}

                {error && !loading && (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>⚠️</Text>
                        <Text style={styles.emptyTitle}>Something went wrong</Text>
                        <Text style={styles.emptyText}>{error}</Text>
                    </View>
                )}

                {!loading && !error && insights && (
                    <>
                        {/* Hero stat */}
                        <Card glow style={styles.heroCard}>
                            <Text style={styles.heroLabel}>{currentYear} Tasks Completed</Text>
                            <Text style={styles.heroTitle}>{insights.tasksCompleted || 0}</Text>
                            <Text style={styles.heroSub}>
                                {insights.tasksCompleted > 50 ? 'Incredible productivity! 🔥' :
                                    insights.tasksCompleted > 20 ? 'Great progress this year! 💪' :
                                        insights.tasksCompleted > 0 ? 'Keep building momentum! 🚀' :
                                            'Start completing tasks to see your progress here'}
                            </Text>
                        </Card>

                        {/* Stats grid */}
                        <View style={styles.gridRow}>
                            <StatCard
                                label="Habits Success"
                                value={`${insights.habitsSuccessRate || 0}%`}
                                color={insights.habitsSuccessRate >= 70 ? colors.success :
                                    insights.habitsSuccessRate >= 40 ? colors.warning : colors.error}
                            />
                            <StatCard
                                label="Memories"
                                value={insights.memoriesRecorded || 0}
                                color={colors.secondary}
                            />
                        </View>

                        {/* Top productive month */}
                        <Card style={styles.bestMonthCard}>
                            <Text style={styles.statLabel}>🏆 Top Productive Month</Text>
                            <Text style={[styles.bestMonthValue, { color: colors.warning }]}>
                                {insights.topProductiveMonth || 'Not enough data yet'}
                            </Text>
                        </Card>

                        {/* Summary message */}
                        <Card style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Year Summary</Text>
                            {insights.tasksCompleted === 0 && insights.memoriesRecorded === 0 ? (
                                <Text style={styles.summaryText}>
                                    Your {currentYear} journey is just beginning! Start completing tasks, building habits, and capturing memories to see a detailed report here.
                                </Text>
                            ) : (
                                <Text style={styles.summaryText}>
                                    {`You've completed ${insights.tasksCompleted} tasks`}
                                    {insights.memoriesRecorded > 0 ? ` and captured ${insights.memoriesRecorded} memories` : ''}
                                    {` this year. `}
                                    {insights.habitsSuccessRate >= 70 ? 'Your habit consistency is excellent!' :
                                        insights.habitsSuccessRate >= 40 ? 'Your habits are progressing well.' :
                                            'Focus on building consistent daily habits.'}
                                    {insights.topProductiveMonth && insights.topProductiveMonth !== 'N/A'
                                        ? ` ${insights.topProductiveMonth} was your most productive month.`
                                        : ''}
                                </Text>
                            )}
                        </Card>

                        {/* Month indicators */}
                        <Card style={styles.monthsCard}>
                            <Text style={styles.monthsTitle}>Monthly Activity</Text>
                            <View style={styles.monthsGrid}>
                                {MONTHS.map((m, i) => {
                                    const isCurrentMonth = i === new Date().getMonth();
                                    const isPast = i < new Date().getMonth();
                                    return (
                                        <View key={m} style={[
                                            styles.monthChip,
                                            isCurrentMonth && styles.monthChipCurrent,
                                            isPast && styles.monthChipPast,
                                        ]}>
                                            <Text style={[
                                                styles.monthText,
                                                isCurrentMonth && styles.monthTextCurrent,
                                            ]}>{m}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </Card>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxxl },

    // Loading & Empty
    loadingBox: { alignItems: 'center', paddingVertical: 80, gap: spacing.md },
    loadingText: { ...typography.body, color: colors.textSecondary },
    emptyBox: { alignItems: 'center', paddingVertical: 60, gap: spacing.sm },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { ...typography.h3, color: colors.textPrimary },
    emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },

    // Hero
    heroCard: { alignItems: 'center', paddingVertical: spacing.xxl },
    heroLabel: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
    heroTitle: { ...typography.h1, fontSize: 56, color: colors.accent },
    heroSub: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },

    // Grid
    gridRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    statCard: { flex: 1, padding: spacing.lg, alignItems: 'center' },
    statLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
    statValue: { ...typography.h2, color: colors.textPrimary },

    // Best month
    bestMonthCard: { marginTop: spacing.md, padding: spacing.lg, alignItems: 'center' },
    bestMonthValue: { ...typography.h2, marginTop: spacing.sm },

    // Summary
    summaryCard: { marginTop: spacing.md, padding: spacing.lg },
    summaryTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm },
    summaryText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },

    // Months
    monthsCard: { marginTop: spacing.md, padding: spacing.lg },
    monthsTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.md },
    monthsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
    monthChip: {
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    },
    monthChipCurrent: { backgroundColor: colors.accentDim, borderColor: colors.accent },
    monthChipPast: { opacity: 0.6 },
    monthText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
    monthTextCurrent: { color: colors.accent },
});

export default YearlyReportScreen;
