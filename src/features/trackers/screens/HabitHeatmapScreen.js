import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';
import trackerService from '../services/trackerService';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildHeatmap = (entries = []) => {
    const entryMap = {};
    entries.forEach(e => {
        if (e.value > 0) entryMap[e.date] = e.value;
    });

    const today = new Date();
    const cells = [];
    for (let i = 364; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const date = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay(); // 0=Sun
        cells.push({
            date,
            done: !!entryMap[date],
            value: entryMap[date] || 0,
            dayOfWeek,
            dayLabel: WEEKDAYS[dayOfWeek === 0 ? 6 : dayOfWeek - 1],
            month: MONTHS_SHORT[d.getMonth()],
            day: d.getDate(),
        });
    }
    return cells;
};

const HabitHeatmapScreen = () => {
    const [cells, setCells] = useState([]);
    const [trackerName, setTrackerName] = useState('');
    const [selectedCell, setSelectedCell] = useState(null);
    const [stats, setStats] = useState({ total: 0, done: 0, streak: 0, bestStreak: 0 });

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                const trackers = await trackerService.getAll();
                if (!trackers[0]) {
                    setCells([]);
                    setTrackerName('');
                    return;
                }
                setTrackerName(trackers[0].name);
                const entries = await trackerService.getEntries(trackers[0].id, 365);
                const heatmap = buildHeatmap(entries);
                setCells(heatmap);

                const doneCount = heatmap.filter(c => c.done).length;
                const streakData = await trackerService.calculateStreak(trackers[0].id);
                setStats({
                    total: 365,
                    done: doneCount,
                    streak: streakData.current,
                    bestStreak: streakData.longest,
                });
            } catch (e) {
                console.error('[HabitHeatmap]', e);
            }
        })();
    }, []));

    const handleCellPress = (cell) => {
        setSelectedCell(prev => prev?.date === cell.date ? null : cell);
    };

    const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

    return (
        <View style={styles.container}>
            <Header title="Habit Heatmap" subtitle={trackerName || 'Last 365 days'} back />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats overview */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.done}</Text>
                        <Text style={styles.statLabel}>Done</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.accent }]}>{stats.streak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.warning }]}>{stats.bestStreak}</Text>
                        <Text style={styles.statLabel}>Best</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.success }]}>{completionRate}%</Text>
                        <Text style={styles.statLabel}>Rate</Text>
                    </View>
                </View>

                {/* Selected cell info */}
                {selectedCell && (
                    <Card style={styles.selectedInfo}>
                        <Text style={styles.selectedDate}>
                            {selectedCell.dayLabel}, {selectedCell.month} {selectedCell.day}
                        </Text>
                        <Text style={[styles.selectedStatus, { color: selectedCell.done ? colors.success : colors.error }]}>
                            {selectedCell.done ? '✓ Completed' : '✗ Missed'}
                        </Text>
                        <Text style={styles.selectedDate}>{selectedCell.date}</Text>
                    </Card>
                )}

                {/* Heatmap grid */}
                <Card style={styles.heatmapCard}>
                    <View style={styles.grid}>
                        {cells.map((cell, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => handleCellPress(cell)}
                                style={[
                                    styles.cell,
                                    cell.done ? styles.done : styles.missed,
                                    selectedCell?.date === cell.date && styles.cellSelected,
                                ]}
                                activeOpacity={0.7}
                            />
                        ))}
                    </View>

                    {/* Legend */}
                    <View style={styles.legendRow}>
                        <Text style={styles.legendLabel}>Less</Text>
                        <View style={[styles.legendCell, styles.missed]} />
                        <View style={[styles.legendCell, styles.done]} />
                        <Text style={styles.legendLabel}>More</Text>
                    </View>
                </Card>

                {/* Empty state */}
                {cells.length === 0 && (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>No trackers found. Create a tracker first to see your heatmap.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },

    // Stats
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-around',
        marginBottom: spacing.lg, marginTop: spacing.sm,
    },
    statItem: { alignItems: 'center' },
    statValue: { ...typography.h2, color: colors.textPrimary },
    statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

    // Selected cell info
    selectedInfo: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: spacing.md, marginBottom: spacing.md,
        backgroundColor: colors.surface,
    },
    selectedDate: { ...typography.caption, color: colors.textSecondary },
    selectedStatus: { ...typography.bodyBold },

    // Heatmap
    heatmapCard: { padding: spacing.md },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
    cell: { width: 12, height: 12, borderRadius: 2 },
    done: { backgroundColor: '#16A34A' },
    missed: { backgroundColor: colors.surfaceLight },
    cellSelected: { borderWidth: 2, borderColor: colors.accent, borderRadius: 3 },

    // Legend
    legendRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: spacing.md, gap: spacing.sm,
    },
    legendCell: { width: 12, height: 12, borderRadius: 2 },
    legendLabel: { ...typography.caption, color: colors.textMuted },

    // Empty
    emptyBox: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});

export default HabitHeatmapScreen;
