import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, FAB, Modal, EmptyState, Card, Button, Input, DateTimeField } from '../../../shared/components';
import useReminderStore from '../store/reminderStore';
import { colors, typography, spacing } from '../../../core/theme';
import { formatDateTime } from '../../../shared/utils';
import { LIFE_AREAS } from '../../../shared/constants/lifeAreas';

const ReminderItem = ({ reminder, onDone, onSnooze, onPress }) => (
    <Card onPress={onPress} style={[styles.card, reminder.is_done && styles.done]}>
        <View style={styles.row}>
            <MaterialCommunityIcons name={reminder.reminder_type === 'location' ? 'map-marker-outline' : 'bell-outline'} size={20} color={reminder.is_done ? colors.textMuted : colors.accent} />
            <View style={styles.content}>
                <Text style={[styles.title, reminder.is_done && styles.doneText]} numberOfLines={1}>{reminder.title}</Text>
                <Text style={styles.time}>{formatDateTime(reminder.datetime)}</Text>
                {reminder.repeat_type !== 'none' ? <Text style={styles.repeat}>Repeat: {reminder.repeat_type}</Text> : null}
                {reminder.location_text ? <Text style={styles.repeat}>Location: {reminder.location_text}</Text> : null}
            </View>
            {!reminder.is_done && (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onSnooze} style={styles.actionBtn}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDone} style={styles.actionBtn}>
                        <MaterialCommunityIcons name="check" size={18} color={colors.success} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    </Card>
);

const ReminderListScreen = ({ navigation }) => {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [remindAt, setRemindAt] = useState('');
    const [description, setDescription] = useState('');
    const [repeatType, setRepeatType] = useState('none');
    const [reminderType, setReminderType] = useState('time');
    const [locationText, setLocationText] = useState('');
    const [lifeArea, setLifeArea] = useState('personal_growth');
    const { upcoming = [], done = [], loadAll, addReminder, markDone, snooze } = useReminderStore();

    useFocusEffect(useCallback(() => { loadAll(); }, []));
    const recentDone = done.slice(0, 5);
    const allReminders = [...upcoming, ...recentDone];

    const handleAdd = async () => {
        if (!title.trim() || !remindAt.trim()) return;
        await addReminder({
            title: title.trim(),
            description,
            datetime: remindAt,
            repeat_type: repeatType,
            reminder_type: reminderType,
            location_text: locationText,
            life_area: lifeArea,
        });
        setTitle('');
        setDescription('');
        setRemindAt('');
        setRepeatType('none');
        setReminderType('time');
        setLocationText('');
        setLifeArea('personal_growth');
        setShowForm(false);
    };

    return (
        <View style={styles.container}>
            <Header title="Reminders" subtitle={`${upcoming.length} upcoming`} />
            {allReminders.length === 0 ? (
                <EmptyState icon="bell-outline" title="No reminders" message="Tap + to create one" />
            ) : (
                <FlatList
                    data={allReminders}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <ReminderItem
                            reminder={item}
                            onDone={() => markDone(item.id)}
                            onSnooze={() => snooze(item.id, 15)}
                            onPress={() => navigation.navigate('ReminderDetail', { reminder: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <FAB onPress={() => setShowForm(true)} />
            <Modal visible={showForm} onClose={() => setShowForm(false)} title="New Reminder">
                <Input label="TITLE" value={title} onChangeText={setTitle} placeholder="Reminder title" />
                <Input label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="Optional" multiline />
                <DateTimeField label="DATE & TIME" value={remindAt} onChange={setRemindAt} mode="datetime" />
                <View style={styles.repeatRow}>
                    {['none', 'daily', 'weekly'].map((r) => (
                        <Button key={r} title={r.charAt(0).toUpperCase() + r.slice(1)} variant={repeatType === r ? 'secondary' : 'ghost'} size="sm" onPress={() => setRepeatType(r)} style={{ flex: 1 }} />
                    ))}
                </View>
                <View style={styles.repeatRow}>
                    {['time', 'habit', 'location'].map((r) => (
                        <Button key={r} title={r.charAt(0).toUpperCase() + r.slice(1)} variant={reminderType === r ? 'secondary' : 'ghost'} size="sm" onPress={() => setReminderType(r)} style={{ flex: 1 }} />
                    ))}
                </View>
                {reminderType === 'location' ? (
                    <Input label="LOCATION" value={locationText} onChangeText={setLocationText} placeholder="e.g. Gym, Office" />
                ) : null}
                <View style={styles.repeatRow}>
                    {LIFE_AREAS.slice(0, 3).map((area) => (
                        <Button
                            key={area.key}
                            title={area.label}
                            variant={lifeArea === area.key ? 'secondary' : 'ghost'}
                            size="sm"
                            onPress={() => setLifeArea(area.key)}
                            style={{ flex: 1 }}
                        />
                    ))}
                </View>
                <View style={styles.formActions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    <Button title="Add" onPress={handleAdd} disabled={!title.trim() || !remindAt.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    card: { marginBottom: spacing.sm },
    done: { opacity: 0.5 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    content: { flex: 1 },
    title: { ...typography.bodyBold, color: colors.textPrimary },
    doneText: { textDecorationLine: 'line-through', color: colors.textMuted },
    time: { ...typography.caption, color: colors.accent, marginTop: 2 },
    repeat: { ...typography.caption, color: colors.secondary, marginTop: 2 },
    actions: { flexDirection: 'row', gap: spacing.sm },
    actionBtn: { padding: spacing.xs },
    repeatRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    formActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});

export default ReminderListScreen;
