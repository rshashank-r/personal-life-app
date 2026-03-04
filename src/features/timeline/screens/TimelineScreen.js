import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, Brain, BookOpen, Flame, Activity } from 'lucide-react-native';
import { Header, Card } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';
import timelineService from '../services/timelineService';

const getTimelineConfig = (type) => {
    switch (type) {
        case 'task':
            return { icon: <CheckCircle2 size={24} color={colors.success} />, label: 'Task completed', bg: 'rgba(34, 197, 94, 0.1)' };
        case 'memory':
            return { icon: <Brain size={24} color={colors.secondary} />, label: 'Memory added', bg: 'rgba(139, 92, 246, 0.1)' };
        case 'reflection':
            return { icon: <BookOpen size={24} color={colors.info} />, label: 'Reflection written', bg: 'rgba(59, 130, 246, 0.1)' };
        case 'habit':
        case 'tracker':
            return { icon: <Flame size={24} color={colors.warning} />, label: 'Habit completed', bg: 'rgba(245, 158, 11, 0.1)' };
        default:
            return { icon: <Activity size={24} color={colors.accent} />, label: 'Activity logged', bg: 'rgba(6, 182, 212, 0.1)' };
    }
};

const TimelineScreen = () => {
    const [items, setItems] = useState([]);

    useFocusEffect(useCallback(() => {
        (async () => {
            const data = await timelineService.getTodayTimeline();
            setItems(data);
        })();
    }, []));

    const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <View style={styles.container}>
            <Header title="Timeline" />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.dateHeaderContainer}>
                    <Text style={styles.dateHeaderText}>{todayDateStr}</Text>
                </View>

                {items.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Activity size={32} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
                        <Text style={styles.emptyText}>No activity logged today yet.</Text>
                        <Text style={styles.emptySubText}>Complete tasks or habits to see them here.</Text>
                    </Card>
                ) : (
                    <View style={styles.timelineWrapper}>
                        {items.map((item, index) => {
                            const config = getTimelineConfig(item.type);
                            const isLast = index === items.length - 1;

                            return (
                                <View key={item.id} style={styles.timelineItemWrapper}>
                                    {/* Timeline Line */}
                                    {!isLast && <View style={styles.timelineLine} />}

                                    <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                                        {config.icon}
                                    </View>

                                    <Card style={styles.activityCard}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.activityLabel}>{config.label}</Text>
                                            <Text style={styles.timeText}>{new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                        </View>
                                        <Text style={styles.activityTitle}>{item.title}</Text>
                                    </Card>
                                </View>
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
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },

    dateHeaderContainer: {
        marginBottom: spacing.xl,
        marginTop: spacing.sm
    },
    dateHeaderText: {
        ...typography.h2,
        color: colors.textPrimary,
    },

    timelineWrapper: {
        paddingLeft: spacing.sm,
    },
    timelineItemWrapper: {
        flexDirection: 'row',
        marginBottom: spacing.xl,
        position: 'relative'
    },
    timelineLine: {
        position: 'absolute',
        left: 23, // center of icon
        top: 48,  // below the icon
        bottom: -spacing.xl,
        width: 2,
        backgroundColor: colors.border
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 1
    },

    activityCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: 16
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs
    },
    activityLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    timeText: {
        ...typography.caption,
        color: colors.textMuted
    },
    activityTitle: {
        ...typography.bodyBold,
        color: colors.textPrimary
    },

    emptyCard: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl
    },
    emptyText: { ...typography.bodyBold, color: colors.textPrimary, textAlign: 'center' },
    emptySubText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
});

export default TimelineScreen;
