import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';
import trackerService from '../services/trackerService';

const buildHeatmap = (entries = []) => {
    const set = new Set(entries.filter((e) => e.value > 0).map((e) => e.date));
    const today = new Date();
    const cells = [];
    for (let i = 364; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const date = d.toISOString().split('T')[0];
        cells.push(set.has(date) ? 1 : 0);
    }
    return cells;
};

const HabitHeatmapScreen = () => {
    const [cells, setCells] = useState([]);

    useFocusEffect(useCallback(() => {
        (async () => {
            const trackers = await trackerService.getAll();
            if (!trackers[0]) return setCells([]);
            const entries = await trackerService.getEntries(trackers[0].id, 365);
            setCells(buildHeatmap(entries));
        })();
    }, []));

    return (
        <View style={styles.container}>
            <Header title="Habit Heatmap" subtitle="Last 365 days (first tracker)" />
            <ScrollView contentContainerStyle={styles.content}>
                <Card>
                    <View style={styles.grid}>
                        {cells.map((cell, idx) => (
                            <View key={idx} style={[styles.cell, cell ? styles.done : styles.missed]} />
                        ))}
                    </View>
                    <Text style={styles.legend}>Green = completed, Gray = missed</Text>
                </Card>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
    cell: { width: 12, height: 12, borderRadius: 2 },
    done: { backgroundColor: '#16A34A' },
    missed: { backgroundColor: colors.surfaceLight },
    legend: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
});

export default HabitHeatmapScreen;
