import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import { getGreeting } from '../../../shared/utils';
import taskService from '../../tasks/services/taskService';
import reminderService from '../../reminders/services/reminderService';
import trackerService from '../../trackers/services/trackerService';
import memoryService from '../../memoryVault/services/memoryService';
import forgetRulesService from '../../forgetRules/services/forgetRulesService';
import analyticsService from '../services/analyticsService';
import motivationService from '../../../core/services/motivationService';
import suggestionService from '../../../core/services/suggestionService';
import { LIFE_AREA_LABELS } from '../../../shared/constants/lifeAreas';
import useProfileStore from '../../../core/store/useProfileStore';

const DashboardScreen = ({ navigation }) => {
    const [todayTasks, setTodayTasks] = useState([]);
    const [todayReminders, setTodayReminders] = useState([]);
    const [trackerStatus, setTrackerStatus] = useState([]);
    const [pinnedMemory, setPinnedMemory] = useState(null);
    const [dailyRule, setDailyRule] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [weeklyInsights, setWeeklyInsights] = useState(null);
    const [lifeScore, setLifeScore] = useState(null);
    const [areaProgress, setAreaProgress] = useState([]);
    const [dailyQuote, setDailyQuote] = useState(null);
    const [motivationMsg, setMotivationMsg] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const profile = useProfileStore(state => state.profile);
    const settings = useProfileStore(state => state.settings);
    const customAppName = settings?.custom_app_name || 'Personal';

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                const [tasks, reminders, trackers, memory, rule, count, insights, score, areaStats, quote, sugs] = await Promise.all([
                    taskService.getTodayDue(),
                    reminderService.getToday(),
                    trackerService.getAllTodayStatus(),
                    memoryService.getRandomPinned(),
                    forgetRulesService.getRandomRule(),
                    taskService.getPendingCount(),
                    analyticsService.getWeeklyInsights(),
                    analyticsService.getLifeHealthScore(),
                    trackerService.getCompletionStatsByArea(),
                    motivationService.getRandomQuote(),
                    suggestionService.getSuggestions()
                ]);
                setTodayTasks(tasks.slice(0, 5));
                setTodayReminders(reminders.slice(0, 5));
                setTrackerStatus(trackers);
                setPinnedMemory(memory);
                setDailyRule(rule);
                setPendingCount(count);
                setWeeklyInsights(insights);
                setLifeScore(score);
                setAreaProgress(areaStats);
                setDailyQuote(quote);
                setSuggestions(sugs);

                // Motivation Calculation
                const completedTasks = tasks.filter((t) => t.status === 'completed').length;
                const completedHabits = trackers.filter((t) => t.done).length;
                setMotivationMsg(motivationService.getDailyMotivation(count, completedTasks, completedHabits, trackers.length));
            } catch (e) {
                console.error('Dashboard error:', e);
            }
        })();
    }, []));

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const tracksDone = trackerStatus.filter((t) => t.done).length;

    const isBirthday = profile?.dob && (
        new Date().getMonth() === new Date(profile.dob).getMonth() &&
        new Date().getDate() === new Date(profile.dob).getDate()
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.greeting}>
                    <Text style={styles.greetText}>{getGreeting()} {profile?.name || ''} 👋</Text>
                    <Text style={styles.dateText}>Welcome to {customAppName} • {today}</Text>
                </View>

                {isBirthday && (
                    <Card glow style={styles.birthdayCard}>
                        <Text style={styles.birthdayTitle}>🎉 Happy Birthday {profile?.name}!</Text>
                        <Text style={styles.birthdaySub}>Another year to grow, learn and build amazing things. Make this year legendary.</Text>
                    </Card>
                )}

                {motivationMsg ? (
                    <View style={styles.motivationContainer}>
                        <MaterialCommunityIcons name="robot-outline" size={20} color={colors.accent} />
                        <Text style={styles.motivationText}>{motivationMsg}</Text>
                    </View>
                ) : null}

                {lifeScore ? (
                    <Card glow style={styles.scoreCard}>
                        <Text style={styles.sectionTitle}>TODAY PROGRESS</Text>
                        <View style={styles.scoreRow}>
                            <View style={{ flex: 1, paddingRight: spacing.lg }}>
                                <Text style={styles.scoreSub}>Tasks: {lifeScore.breakdown.tasks}%</Text>
                                <Text style={styles.scoreSub}>Habits: {lifeScore.breakdown.habits}%</Text>
                                <Text style={styles.scoreSub}>Reminders: {lifeScore.breakdown.reminders}%</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.scoreText}>{lifeScore.total}%</Text>
                                <Text style={styles.sectionTitle}>OVERALL</Text>
                            </View>
                        </View>
                    </Card>
                ) : null}

                {suggestions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>SUGGESTIONS</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                            {suggestions.map((sug, i) => (
                                <TouchableOpacity
                                    key={`sug-${i}`}
                                    activeOpacity={sug.action ? 0.7 : 1}
                                    onPress={() => {
                                        if (sug.action) navigation.navigate(sug.action.screen, sug.action.params);
                                    }}
                                >
                                    <Card style={[styles.suggestionCard, sug.type === 'smart' && styles.smartCard]}>
                                        <MaterialCommunityIcons
                                            name={sug.icon}
                                            size={24}
                                            color={sug.type === 'smart' ? colors.warning : colors.accent}
                                        />
                                        <Text style={styles.suggestionText}>{sug.message}</Text>
                                    </Card>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.statsRow}>
                    {[
                        { num: pendingCount, label: 'Tasks' },
                        { num: todayReminders.length, label: 'Reminders' },
                        { num: `${tracksDone}/${trackerStatus.length}`, label: 'Tracked' },
                    ].map((s) => (
                        <Card key={s.label} style={styles.statCard}>
                            <Text style={styles.statNum}>{s.num}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </Card>
                    ))}
                </View>

                {weeklyInsights ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>WEEKLY INSIGHTS</Text>
                        <Card>
                            <Text style={styles.insightText}>Tasks completed: {weeklyInsights.tasksCompleted}</Text>
                            <Text style={styles.insightText}>Habits success rate: {weeklyInsights.habitsSuccessRate}%</Text>
                            <Text style={styles.insightText}>Best day: {weeklyInsights.topProductiveDay}</Text>
                            <Text style={styles.insightText}>Missed habits: {weeklyInsights.missedHabits}</Text>
                        </Card>
                    </View>
                ) : null}

                {areaProgress.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>LIFE AREAS</Text>
                        {areaProgress.map((item) => {
                            const total = Number(item.total || 0);
                            const done = Number(item.completed || 0);
                            const pct = total ? Math.round((done / total) * 100) : 0;
                            return (
                                <Card key={item.life_area} style={styles.areaCard}>
                                    <View style={styles.areaRow}>
                                        <Text style={styles.areaLabel}>{LIFE_AREA_LABELS[item.life_area] || 'Personal Growth'}</Text>
                                        <Text style={styles.areaValue}>{pct}%</Text>
                                    </View>
                                    <View style={styles.progressBg}>
                                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                                    </View>
                                </Card>
                            );
                        })}
                    </View>
                ) : null}

                <View style={styles.quickRow}>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Timeline')}>
                        <MaterialCommunityIcons name="timeline-clock-outline" size={18} color={colors.accent} />
                        <Text style={styles.quickText}>Timeline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Journal')}>
                        <MaterialCommunityIcons name="notebook-edit-outline" size={18} color={colors.secondary} />
                        <Text style={styles.quickText}>Journal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Scheduler')}>
                        <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.warning} />
                        <Text style={styles.quickText}>Schedule</Text>
                    </TouchableOpacity>
                </View>

                {todayTasks.length > 0 && (
                    <View style={styles.section}>
                        <TouchableOpacity onPress={() => navigation.navigate('Tasks')} style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>TODAY TASKS</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                        {todayTasks.map((t) => (
                            <Card key={t.id} style={styles.itemCard}>
                                <View style={styles.itemRow}>
                                    <View style={[styles.dot, { backgroundColor: t.priority === 'high' ? colors.error : t.priority === 'medium' ? colors.warning : colors.success }]} />
                                    <Text style={styles.itemText} numberOfLines={1}>{t.title}</Text>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                {trackerStatus.length > 0 && (
                    <View style={styles.section}>
                        <TouchableOpacity onPress={() => navigation.navigate('Trackers')} style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>TRACKERS</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                        <View style={styles.trackersGrid}>
                            {trackerStatus.map((t) => (
                                <Card key={t.id} style={[styles.trackerChip, t.done && styles.trackerDone]}>
                                    <MaterialCommunityIcons name={t.done ? 'check-circle' : 'circle-outline'} size={14} color={t.done ? colors.success : colors.textMuted} />
                                    <Text style={[styles.trackerName, t.done && { color: colors.success }]}>{t.name}</Text>
                                    <MaterialCommunityIcons name="fire" size={12} color={colors.warning} />
                                    <Text style={styles.trackerStreak}>{t.streak || 0}</Text>
                                </Card>
                            ))}
                        </View>
                    </View>
                )}

                {pinnedMemory && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PINNED MEMORY</Text>
                        <Card glow style={styles.memCard}>
                            <Text style={styles.memTitle}>{pinnedMemory.title}</Text>
                            <Text style={styles.memPreview} numberOfLines={2}>{pinnedMemory.content}</Text>
                        </Card>
                    </View>
                )}

                {dailyRule && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>REMEMBER THIS</Text>
                        <Card style={styles.ruleCard}>
                            <MaterialCommunityIcons name="brain" size={20} color={colors.secondary} />
                            <Text style={styles.ruleText}>{dailyRule.content}</Text>
                        </Card>
                    </View>
                )}

                {dailyQuote && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>QUOTE OF THE DAY</Text>
                        <Card style={styles.quoteCard}>
                            <Text style={styles.quoteText}>"{dailyQuote.content}"</Text>
                            <Text style={styles.quoteAuthor}>— {dailyQuote.author || 'Unknown'}</Text>
                        </Card>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: spacing.lg },
    greeting: { paddingTop: spacing.xxl, paddingBottom: spacing.lg },
    greetText: { ...typography.h1, color: colors.textPrimary, fontSize: 30 },
    dateText: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
    sectionTitle: { ...typography.label, color: colors.textSecondary },
    scoreCard: { marginBottom: spacing.lg },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    scoreText: { ...typography.h1, color: colors.warning },
    scoreSub: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
    statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
    statNum: { ...typography.h2, color: colors.accent, fontSize: 22 },
    statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
    section: { marginBottom: spacing.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    insightText: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.xs },
    areaCard: { marginBottom: spacing.sm },
    areaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    areaLabel: { ...typography.bodyBold, color: colors.textPrimary },
    areaValue: { ...typography.bodyBold, color: colors.accent },
    progressBg: { backgroundColor: colors.background, height: 8, borderRadius: 5, overflow: 'hidden' },
    progressFill: { backgroundColor: colors.accent, height: 8 },
    quickRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    quickBtn: {
        flex: 1,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    quickText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
    itemCard: { marginBottom: spacing.xs, paddingVertical: spacing.md },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    dot: { width: 8, height: 8, borderRadius: 4 },
    itemText: { ...typography.body, color: colors.textPrimary, flex: 1 },
    trackersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    trackerChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    trackerDone: { borderColor: 'rgba(52,211,153,0.2)' },
    trackerName: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
    trackerStreak: { ...typography.caption, color: colors.warning },
    memCard: { marginTop: spacing.sm },
    memTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.xs },
    memPreview: { ...typography.body, color: colors.textSecondary },
    ruleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginTop: spacing.sm },
    ruleText: { ...typography.body, color: colors.textPrimary, flex: 1, lineHeight: 22 },
    birthdayCard: { marginBottom: spacing.lg, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: colors.warning },
    birthdayTitle: { ...typography.h3, color: colors.warning, marginBottom: spacing.xs },
    birthdaySub: { ...typography.body, color: colors.textSecondary },
    motivationContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
    motivationText: { ...typography.caption, color: colors.textSecondary, flex: 1, fontStyle: 'italic' },
    quoteCard: { marginTop: spacing.sm, alignItems: 'center', paddingVertical: spacing.xl },
    quoteText: { ...typography.bodyBold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm, fontStyle: 'italic', fontSize: 18 },
    quoteAuthor: { ...typography.caption, color: colors.accent },
    suggestionsScroll: { gap: spacing.sm, paddingRight: spacing.lg },
    suggestionCard: { width: 220, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center', minHeight: 90 },
    smartCard: { borderColor: colors.warning, backgroundColor: 'rgba(245, 158, 11, 0.05)' },
    suggestionText: { ...typography.body, color: colors.textPrimary, flex: 1 }
});

export default DashboardScreen;
