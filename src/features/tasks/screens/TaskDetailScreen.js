import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Header, Card, Button, Input, PriorityBadge, DateTimeField } from '../../../shared/components';
import useTaskStore from '../store/taskStore';
import { colors, typography, spacing } from '../../../core/theme';
import { getRelativeDate } from '../../../shared/utils';

const TaskDetailScreen = ({ route, navigation }) => {
    const { task } = route.params;
    const { updateTask, toggleTask, deleteTask } = useTaskStore();
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState(task.priority);
    const [dueDate, setDueDate] = useState(task.due_date || '');
    const [durationMinutes, setDurationMinutes] = useState(String(task.duration_minutes || 30));

    const handleSave = async () => {
        if (!title.trim()) return;
        await updateTask(task.id, {
            title: title.trim(),
            description,
            priority,
            due_date: dueDate,
            duration_minutes: parseInt(durationMinutes, 10) || 30,
        });
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert('Delete Task', `Delete "${task.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTask(task.id); navigation.goBack(); } },
        ]);
    };

    if (editing) {
        return (
            <View style={styles.container}>
                <Header title="Edit Task" />
                <ScrollView style={styles.content}>
                    <Input label="TITLE" value={title} onChangeText={setTitle} />
                    <Input label="DESCRIPTION" value={description} onChangeText={setDescription} multiline />
                    <View style={styles.priorityRow}>
                        {['low', 'medium', 'high'].map((p) => (
                            <Button key={p} title={p.charAt(0).toUpperCase() + p.slice(1)} variant={priority === p ? 'secondary' : 'ghost'} size="sm" onPress={() => setPriority(p)} style={{ flex: 1 }} />
                        ))}
                    </View>
                    <Input label="DURATION (MINUTES)" value={durationMinutes} onChangeText={setDurationMinutes} keyboardType="numeric" />
                    <DateTimeField label="DUE DATE" value={dueDate} onChange={setDueDate} mode="date" placeholder="Optional" />
                    <View style={styles.actions}>
                        <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                        <Button title="Save" onPress={handleSave} style={{ flex: 2 }} />
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Task Detail" />
            <ScrollView style={styles.content}>
                <Card glow={!task.completed}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <PriorityBadge priority={task.priority} />
                    {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}
                    {task.due_date ? <Text style={styles.date}>Due: {getRelativeDate(task.due_date)}</Text> : null}
                    <Text style={styles.status}>{task.completed ? 'Completed' : 'Pending'}</Text>
                </Card>
                <View style={styles.actions}>
                    <Button title={task.completed ? 'Reopen' : 'Complete'} variant="secondary" onPress={async () => { await toggleTask(task.id); navigation.goBack(); }} style={{ flex: 1 }} />
                    <Button title="Edit" variant="ghost" onPress={() => setEditing(true)} style={{ flex: 1 }} />
                    <Button title="Delete" variant="danger" onPress={handleDelete} style={{ flex: 1 }} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    taskTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
    desc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
    date: { ...typography.caption, color: colors.accent, marginTop: spacing.sm },
    status: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
    priorityRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, paddingBottom: spacing.xxxl },
});

export default TaskDetailScreen;
