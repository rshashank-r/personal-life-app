import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Sparkles, CheckCircle, Flame, Bell, ChevronRight, CheckCircle2, Circle, BellRing, Quote } from 'lucide-react-native';
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
import ScreenTimeTracker from '../../trackers/components/ScreenTimeTracker';

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

                {/* Header: Branding + Greeting + Date */}
                <View style={styles.header}>
                    <View style={styles.brandingRow}>
                        {settings?.custom_app_logo ? (
                            <Image source={{ uri: settings.custom_app_logo }} style={styles.customLogo} />
                        ) : null}
                        {customAppName !== 'Personal' && customAppName !== '' ? (
                            <Text style={styles.customAppName}>{customAppName}</Text>
                        ) : null}
                    </View>
                    <Text style={styles.greetingText}>{getGreeting()} {profile?.name || ''}</Text>
                    <Text style={styles.dateText}>{today}</Text>
                </View>

                {isBirthday && (
                    <Card glow style={styles.birthdayCard}>
                        <Text style={styles.birthdayTitle}>🎉 Happy Birthday {profile?.name}!</Text>
                        <Text style={styles.birthdaySub}>Another year to grow, learn and build amazing things. Make this year legendary.</Text>
                    </Card>
                )}

                {/* Daily Score Card */}
                {lifeScore ? (
                    <Card glow style={styles.dailyScoreCard}>
                        <View style={styles.scoreCardContent}>
                            <View>
                                <Text style={styles.dailyScoreLabel}>Daily Score</Text>
                                <Text style={styles.dailyScoreValue}>{lifeScore.total}/100</Text>
                            </View>
                            <Sparkles size={40} color={colors.warning} />
                        </View>
                        <Text style={styles.dailyScoreMessage}>{motivationMsg || "You are doing great today"}</Text>
                    </Card>
                ) : null}

                {/* Quick Stats Row */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Stats</Text>
                    <View style={styles.quickStatsRow}>
                        <Card style={styles.quickStatCard}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
                                <CheckCircle size={24} color={colors.success} />
                            </View>
                            <Text style={styles.statCount}>{pendingCount}</Text>
                            <Text style={styles.statLabel}>Tasks</Text>
                        </Card>
                        <Card style={styles.quickStatCard}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Flame size={24} color={colors.warning} />
                            </View>
                            <Text style={styles.statCount}>{tracksDone}/{trackerStatus.length}</Text>
                            <Text style={styles.statLabel}>Habits</Text>
                        </Card>
                        <Card style={styles.quickStatCard}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                                <Bell size={24} color={colors.accent} />
                            </View>
                            <Text style={styles.statCount}>{todayReminders.length}</Text>
                            <Text style={styles.statLabel}>Reminders</Text>
                        </Card>
                    </View>
                </View>

                {/* Today Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today</Text>

                    {/* Today's Tasks */}
                    {todayTasks.length > 0 && (
                        <View style={styles.subSection}>
                            <TouchableOpacity onPress={() => navigation.navigate('Tasks')} style={styles.sectionHeader}>
                                <Text style={styles.subSectionTitle}>Tasks</Text>
                                <ChevronRight size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                            {todayTasks.map((t) => (
                                <Card key={t.id} style={styles.listItemCard}>
                                    <View style={styles.itemRow}>
                                        {t.status === 'completed' ? (
                                            <CheckCircle2 size={20} color={colors.success} />
                                        ) : (
                                            <Circle size={20} color={colors.textMuted} />
                                        )}
                                        <Text style={[styles.itemText, t.status === 'completed' && styles.itemTextCompleted]} numberOfLines={1}>{t.title}</Text>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    )}

                    {/* Today's Reminders */}
                    {todayReminders.length > 0 && (
                        <View style={styles.subSection}>
                            <TouchableOpacity onPress={() => navigation.navigate('Reminders')} style={styles.sectionHeader}>
                                <Text style={styles.subSectionTitle}>Reminders</Text>
                                <ChevronRight size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                            {todayReminders.map((r) => (
                                <Card key={r.id} style={styles.listItemCard}>
                                    <View style={styles.itemRow}>
                                        <BellRing size={20} color={colors.accent} />
                                        <Text style={styles.itemText} numberOfLines={1}>{r.title}</Text>
                                        <Text style={styles.itemTime}>{r.time}</Text>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    )}

                    {todayTasks.length === 0 && todayReminders.length === 0 && (
                        <Text style={styles.emptyText}>Nothing scheduled for today yet.</Text>
                    )}
                </View>

                {/* Insights Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Insights</Text>

                    {/* AI Suggestions */}
                    {suggestions.length > 0 && (
                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>AI Suggestions</Text>
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
                                            <View style={styles.suggestionIconWrapper}>
                                                <Sparkles size={24} color={sug.type === 'smart' ? colors.warning : colors.accent} />
                                            </View>
                                            <Text style={styles.suggestionText}>{sug.message}</Text>
                                        </Card>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Screen Time */}
                    <View style={styles.subSection}>
                        <Text style={styles.subSectionTitle}>Screen Time</Text>
                        <ScreenTimeTracker />
                    </View>
                </View>

                {/* Quote of the Day */}
                {dailyQuote && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quote of the Day</Text>
                        <Card style={styles.quoteCard}>
                            <Quote size={30} color={colors.accent} style={styles.quoteIcon} />
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

    // Header
    header: { paddingTop: spacing.xxl, paddingBottom: spacing.xl },
    brandingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    customLogo: { width: 32, height: 32, borderRadius: 8, marginRight: spacing.sm },
    customAppName: { ...typography.h3, color: colors.textPrimary },
    greetingText: { ...typography.h1, color: colors.textPrimary, fontSize: 32, marginBottom: 4 },
    dateText: { ...typography.body, color: colors.textSecondary },

    // Daily Score Card
    dailyScoreCard: { marginBottom: spacing.xl, padding: spacing.xl, borderRadius: 20 },
    scoreCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    dailyScoreLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
    dailyScoreValue: { ...typography.h1, color: colors.textPrimary, fontSize: 36 },
    dailyScoreMessage: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic' },

    // General Section Stylings
    section: { marginBottom: spacing.xl },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.lg },
    subSectionTitle: { ...typography.bodyBold, color: colors.textSecondary, marginBottom: spacing.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    subSection: { marginBottom: spacing.lg },

    // Quick Stats Row
    quickStatsRow: { flexDirection: 'row', gap: spacing.md },
    quickStatCard: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: 16 },
    iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    statCount: { ...typography.h2, color: colors.textPrimary, marginBottom: 4 },
    statLabel: { ...typography.caption, color: colors.textSecondary },

    // Today Section
    listItemCard: { padding: spacing.md, marginBottom: spacing.sm, borderRadius: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    itemText: { ...typography.body, color: colors.textPrimary, flex: 1 },
    itemTextCompleted: { textDecorationLine: 'line-through', color: colors.textMuted },
    itemTime: { ...typography.caption, color: colors.textSecondary },
    emptyText: { ...typography.body, color: colors.textMuted, fontStyle: 'italic' },

    // Insights Section
    suggestionsScroll: { gap: spacing.sm, paddingRight: spacing.lg },
    suggestionCard: { width: 240, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center', borderRadius: 16 },
    smartCard: { borderColor: colors.warning, backgroundColor: 'rgba(245, 158, 11, 0.05)' },
    suggestionIconWrapper: { padding: spacing.sm, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    suggestionText: { ...typography.body, color: colors.textPrimary, flex: 1 },

    // Quote of the Day
    quoteCard: { padding: spacing.xl, alignItems: 'center', borderRadius: 16 },
    quoteIcon: { marginBottom: spacing.md },
    quoteText: { ...typography.bodyBold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md, fontStyle: 'italic', fontSize: 16, lineHeight: 24 },
    quoteAuthor: { ...typography.caption, color: colors.textSecondary },

    // Birthday
    birthdayCard: { marginBottom: spacing.lg, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: colors.warning },
    birthdayTitle: { ...typography.h3, color: colors.warning, marginBottom: spacing.xs },
    birthdaySub: { ...typography.body, color: colors.textSecondary },
});

export default DashboardScreen;
