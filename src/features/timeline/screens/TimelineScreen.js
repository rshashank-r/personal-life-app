import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Card } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';
import timelineService from '../services/timelineService';

const TimelineScreen = () => {
    const [items, setItems] = useState([]);

    useFocusEffect(useCallback(() => {
        (async () => {
            const data = await timelineService.getTodayTimeline();
            setItems(data);
        })();
    }, []));

    return (
        <View style={styles.container}>
            <Header title="Life Timeline" subtitle="Today" />
            <ScrollView contentContainerStyle={styles.content}>
                {items.length === 0 ? (
                    <Card><Text style={styles.empty}>No activity logged today yet.</Text></Card>
                ) : items.map((item) => (
                    <Card key={item.id} style={styles.item}>
                        <View style={styles.row}>
                            <MaterialCommunityIcons name={item.icon} size={18} color={colors.accent} />
                            <View style={styles.textCol}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.time}>{new Date(item.at).toLocaleTimeString()}</Text>
                            </View>
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
    empty: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
    item: { marginBottom: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    textCol: { flex: 1 },
    title: { ...typography.bodyBold, color: colors.textPrimary },
    time: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});

export default TimelineScreen;
