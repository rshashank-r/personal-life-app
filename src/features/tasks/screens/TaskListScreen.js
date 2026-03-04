import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarClock, Timer, CheckSquare, Circle, CheckCircle2 } from 'lucide-react-native';
import { Header, FAB, Modal, EmptyState, FilterChips, Card, Button, Input, DateTimeField } from '../../../shared/components';
import useTaskStore from '../store/taskStore';
import { colors, typography, spacing } from '../../../core/theme';
import { getRelativeDate } from '../../../shared/utils';
import { LIFE_AREAS } from '../../../shared/constants/lifeAreas';

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return colors.error;
        case 'medium': return colors.warning;
        case 'low': return colors.success;
        default: return colors.textMuted;
    }
};

const getPriorityBgColor = (priority) => {
    switch (priority) {
        case 'high': return 'rgba(239, 68, 68, 0.1)';
        case 'medium': return 'rgba(245, 158, 11, 0.1)';
        case 'low': return 'rgba(52, 211, 153, 0.1)';
        default: return 'rgba(255, 255, 255, 0.05)';
    }
};

const TaskItem = ({ task, onToggle, onPress }) => (
    <Card onPress={onPress} style={[styles.taskCard, { borderLeftWidth: 4, borderLeftColor: getPriorityColor(task.priority) }]}>
        <View style={styles.taskHeaderRow}>
            <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
                {task.completed ? (
                    <CheckCircle2 size={28} color={colors.success} />
                ) : (
                    <Circle size={28} color={colors.textMuted} />
                )}
            </TouchableOpacity>
            <Text style={[styles.taskTitle, task.completed && styles.completed]} numberOfLines={1}>{task.title}</Text>
        </View>
        <View style={styles.taskDetailsRow}>
            {task.due_date ? (
                <View style={styles.detailBadge}>
                    <CalendarClock size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{getRelativeDate(task.due_date)}</Text>
                </View>
            ) : null}
            <View style={[styles.detailBadge, { backgroundColor: getPriorityBgColor(task.priority) }]}>
                <Text style={[styles.detailText, { color: getPriorityColor(task.priority), fontWeight: '600', textTransform: 'capitalize' }]}>
                    {task.priority} Priority
                </Text>
            </View>
            {task.duration_minutes ? (
                <View style={styles.detailBadge}>
                    <Timer size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{task.duration_minutes} min</Text>
                </View>
            ) : null}
        </View>
    </Card>
);

const TaskListScreen = ({ navigation }) => {
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('30');
    const [lifeArea, setLifeArea] = useState('personal_growth');
    const { tasks, loadAll, addTask, toggleTask } = useTaskStore();

    useFocusEffect(useCallback(() => { loadAll(filter); }, [filter]));

    const filtered = tasks.filter((t) => {
        if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return t.due_date && t.due_date.startsWith(today);
        }
        if (['high', 'medium', 'low'].includes(filter)) return t.priority === filter;
        return true;
    });

    const pending = filtered.filter((t) => !t.completed);
    const done = filtered.filter((t) => t.completed);

    const handleAdd = async () => {
        if (!title.trim()) return;
        await addTask({
            title: title.trim(),
            description,
            priority,
            due_date: dueDate,
            duration_minutes: parseInt(durationMinutes, 10) || 30,
            life_area: lifeArea,
        });
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setDurationMinutes('30');
        setLifeArea('personal_growth');
        setShowForm(false);
    };

    return (
        <View style={styles.container}>
            <Header title="Tasks" subtitle={`${pending.length} pending`} />
            <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
            {filtered.length === 0 ? (
                <EmptyState icon="checkbox-marked-circle-outline" title="No tasks" message="Tap + to add a task" customIcon={<CheckSquare size={48} color={colors.textMuted} />} />
            ) : (
                <FlatList
                    data={[...pending, ...done]}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <TaskItem
                            task={item}
                            onToggle={() => toggleTask(item.id)}
                            onPress={() => navigation.navigate('TaskDetail', { task: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <FAB onPress={() => setShowForm(true)} />
            <Modal visible={showForm} onClose={() => setShowForm(false)} title="New Task">
                <Input label="TITLE" value={title} onChangeText={setTitle} placeholder="What needs to be done?" />
                <Input label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="Optional details" multiline />
                <View style={styles.priorityRow}>
                    {['low', 'medium', 'high'].map((p) => (
                        <Button key={p} title={p.charAt(0).toUpperCase() + p.slice(1)} variant={priority === p ? 'secondary' : 'ghost'} size="sm" onPress={() => setPriority(p)} style={{ flex: 1 }} />
                    ))}
                </View>
                <Input label="DURATION (MINUTES)" value={durationMinutes} onChangeText={setDurationMinutes} keyboardType="numeric" />
                <DateTimeField label="DUE DATE" value={dueDate} onChange={setDueDate} mode="date" placeholder="Optional" />
                <View style={styles.priorityRow}>
                    {LIFE_AREAS.slice(0, 3).map((area) => (
                        <Button key={area.key} title={area.label} variant={lifeArea === area.key ? 'secondary' : 'ghost'} size="sm" onPress={() => setLifeArea(area.key)} style={{ flex: 1 }} />
                    ))}
                </View>
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    <Button title="Add Task" onPress={handleAdd} disabled={!title.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.sm },

    // Task Card Stylings
    taskCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: 12,
    },
    taskHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: spacing.sm
    },
    checkbox: {
        marginRight: spacing.xs
    },
    taskTitle: {
        ...typography.bodyBold,
        color: colors.textPrimary,
        fontSize: 18,
        flex: 1
    },
    completed: {
        textDecorationLine: 'line-through',
        color: colors.textMuted
    },
    taskDetailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        paddingLeft: 40 // Align with text start
    },
    detailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4
    },
    detailText: {
        ...typography.caption,
        color: colors.textSecondary
    },

    // Form Stylings
    priorityRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});

export default TaskListScreen;
