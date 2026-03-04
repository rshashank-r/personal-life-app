import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal as RNModal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Sparkles, CheckCircle, Flame, Bell, ChevronRight, CheckCircle2, Circle, BellRing, Quote, X } from 'lucide-react-native';
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
import { LIFE_AREA_LABELS } from '../../../shared/constants/lifeAreas';
import useProfileStore from '../../../core/store/useProfileStore';
import ScreenTimeTracker from '../../trackers/components/ScreenTimeTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUOTE_SHOWN_KEY = 'quote_last_shown_date';

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
    const [showQuotePopup, setShowQuotePopup] = useState(false);

    const profile = useProfileStore(state => state.profile);
    const settings = useProfileStore(state => state.settings);
    const customAppName = settings?.custom_app_name || 'Personal';

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                const [tasks, reminders, trackers, memory, rule, count, insights, score, areaStats, quote] = await Promise.all([
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

                // Motivation Calculation
                const completedTasks = tasks.filter((t) => t.status === 'completed').length;
                const completedHabits = trackers.filter((t) => t.done).length;
                setMotivationMsg(motivationService.getDailyMotivation(count, completedTasks, completedHabits, trackers.length));

                // Show quote popup once per day
                if (quote) {
                    try {
                        const today = new Date().toISOString().split('T')[0];
                        const lastShown = await AsyncStorage.getItem(QUOTE_SHOWN_KEY);
                        if (lastShown !== today) {
                            setShowQuotePopup(true);
                            await AsyncStorage.setItem(QUOTE_SHOWN_KEY, today);
                        }
                    } catch (e) {
                        // AsyncStorage failure — show anyway first time
                        setShowQuotePopup(true);
                    }
                }
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
            {/* Quote of the Day Popup */}
            <RNModal
                visible={showQuotePopup && !!dailyQuote}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQuotePopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.quoteModal}>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowQuotePopup(false)}>
                            <X size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                        <Quote size={36} color={colors.accent} style={{ marginBottom: spacing.md }} />
                        <Text style={styles.quoteModalLabel}>Quote of the Day</Text>
                        <Text style={styles.quoteModalText}>"{dailyQuote?.content}"</Text>
                        <Text style={styles.quoteModalAuthor}>— {dailyQuote?.author || 'Unknown'}</Text>
                        <TouchableOpacity style={styles.quoteModalBtn} onPress={() => setShowQuotePopup(false)}>
                            <Text style={styles.quoteModalBtnText}>Start Your Day</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RNModal>

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

                {/* Screen Time */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Screen Time</Text>
                    <ScreenTimeTracker />
                </View>

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

    // Birthday
    birthdayCard: { marginBottom: spacing.lg, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: colors.warning },
    birthdayTitle: { ...typography.h3, color: colors.warning, marginBottom: spacing.xs },
    birthdaySub: { ...typography.body, color: colors.textSecondary },

    // Quote Modal Popup
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    quoteModal: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: spacing.xxl,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalClose: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        padding: spacing.xs,
    },
    quoteModalLabel: {
        ...typography.caption,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: spacing.md,
    },
    quoteModalText: {
        ...typography.h3,
        color: colors.textPrimary,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 28,
        marginBottom: spacing.lg,
    },
    quoteModalAuthor: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    quoteModalBtn: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        borderRadius: 24,
    },
    quoteModalBtnText: {
        ...typography.bodyBold,
        color: colors.background,
    },
});

export default DashboardScreen;
