import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card, Modal, FAB, Input, Button } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';
import goalService from '../services/goalService';

const GoalScreen = () => {
    const [goals, setGoals] = useState([]);
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [deadline, setDeadline] = useState('');

    const load = async () => setGoals(await goalService.getAll());
    useFocusEffect(useCallback(() => { load(); }, []));

    const add = async () => {
        if (!title.trim()) return;
        await goalService.create({ title: title.trim(), notes, deadline, progress: 0 });
        setTitle('');
        setNotes('');
        setDeadline('');
        setVisible(false);
        load();
    };

    return (
        <View style={styles.container}>
            <Header title="Goals" subtitle="Long-term direction and progress" />
            <ScrollView contentContainerStyle={styles.content}>
                {goals.length === 0 ? (
                    <Card><Text style={styles.empty}>No goals yet.</Text></Card>
                ) : goals.map((goal) => (
                    <Card key={goal.id} style={styles.card}>
                        <Text style={styles.title}>{goal.title}</Text>
                        <Text style={styles.meta}>Progress: {Math.round(goal.progress || 0)}%</Text>
                        {goal.deadline ? <Text style={styles.meta}>Deadline: {goal.deadline}</Text> : null}
                    </Card>
                ))}
            </ScrollView>
            <FAB onPress={() => setVisible(true)} />
            <Modal visible={visible} onClose={() => setVisible(false)} title="New Goal">
                <Input label="TITLE" value={title} onChangeText={setTitle} placeholder="Goal title" />
                <Input label="NOTES" value={notes} onChangeText={setNotes} multiline />
                <Input label="DEADLINE" value={deadline} onChangeText={setDeadline} placeholder="YYYY-MM-DD" />
                <View style={styles.row}>
                    <Button title="Cancel" variant="ghost" onPress={() => setVisible(false)} style={{ flex: 1 }} />
                    <Button title="Create" onPress={add} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
    card: { marginBottom: spacing.sm },
    empty: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
    title: { ...typography.bodyBold, color: colors.textPrimary },
    meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});

export default GoalScreen;
