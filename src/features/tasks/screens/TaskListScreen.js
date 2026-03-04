import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, FAB, Modal, EmptyState, FilterChips, Card, Button, Input, PriorityBadge, DateTimeField } from '../../../shared/components';
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

const TaskItem = ({ task, onToggle, onPress }) => (
    <Card onPress={onPress} style={styles.taskCard}>
        <View style={styles.taskRow}>
            <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
                <MaterialCommunityIcons
                    name={task.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={task.completed ? colors.success : colors.textMuted}
                />
            </TouchableOpacity>
            <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, task.completed && styles.completed]} numberOfLines={1}>{task.title}</Text>
                {task.due_date ? <Text style={styles.taskDate}>{getRelativeDate(task.due_date)}</Text> : null}
            </View>
            <PriorityBadge priority={task.priority} />
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
                <EmptyState icon="checkbox-marked-circle-outline" title="No tasks" message="Tap + to add a task" />
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
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    taskCard: { marginBottom: spacing.sm },
    taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    checkbox: { padding: spacing.xs },
    taskContent: { flex: 1 },
    taskTitle: { ...typography.bodyBold, color: colors.textPrimary },
    completed: { textDecorationLine: 'line-through', color: colors.textMuted },
    taskDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    priorityRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});

export default TaskListScreen;
