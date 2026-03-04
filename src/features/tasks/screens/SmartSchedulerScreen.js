import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header, Card, Button } from '../../../shared/components';
import useTaskStore from '../store/taskStore';
import taskService from '../services/taskService';
import { colors, spacing, typography } from '../../../core/theme';

const SmartSchedulerScreen = () => {
    const { tasks, loadAll } = useTaskStore();
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        loadAll();
    }, []);

    const generate = async () => {
        const pending = tasks.filter((task) => !task.completed);
        const suggested = await taskService.suggestSchedule(pending.slice(0, 8));
        setSuggestions(suggested);
    };

    useEffect(() => {
        if (tasks.length > 0) {
            generate();
        }
    }, [tasks.length]);

    return (
        <View style={styles.container}>
            <Header title="Smart Scheduler" subtitle="Auto time-block your day by priority and duration" />
            <ScrollView contentContainerStyle={styles.content}>
                <Button title="Regenerate Schedule" onPress={generate} />
                {suggestions.length === 0 ? (
                    <Card style={styles.card}><Text style={styles.empty}>Add tasks with due dates to get suggestions.</Text></Card>
                ) : suggestions.map((item) => (
                    <Card key={item.id} style={styles.card}>
                        <Text style={styles.time}>{item.suggested_range}</Text>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.meta}>Priority: {item.priority} | Duration: {item.duration_minutes || 30} mins</Text>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
    card: { marginTop: spacing.sm },
    empty: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
    time: { ...typography.bodyBold, color: colors.accent },
    title: { ...typography.body, color: colors.textPrimary, marginTop: spacing.xs },
    meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});

export default SmartSchedulerScreen;
