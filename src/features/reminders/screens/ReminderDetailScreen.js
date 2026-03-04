import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Header, Card, Button, Input, DateTimeField } from '../../../shared/components';
import useReminderStore from '../store/reminderStore';
import { colors, typography, spacing } from '../../../core/theme';
import { formatDateTime } from '../../../shared/utils';

const ReminderDetailScreen = ({ route, navigation }) => {
    const { reminder } = route.params;
    const { updateReminder, markDone, snooze, deleteReminder } = useReminderStore();
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(reminder.title);
    const [description, setDescription] = useState(reminder.description || '');
    const [remindAt, setRemindAt] = useState(reminder.datetime || '');

    const handleSave = async () => {
        await updateReminder(reminder.id, { title: title.trim(), description, datetime: remindAt });
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert('Delete', `Delete "${reminder.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { await deleteReminder(reminder.id); navigation.goBack(); } },
        ]);
    };

    if (editing) {
        return (
            <View style={styles.container}>
                <Header title="Edit Reminder" />
                <ScrollView style={styles.content}>
                    <Input label="TITLE" value={title} onChangeText={setTitle} />
                    <Input label="DESCRIPTION" value={description} onChangeText={setDescription} multiline />
                    <DateTimeField label="DATE & TIME" value={remindAt} onChange={setRemindAt} mode="datetime" />
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
            <Header title="Reminder" />
            <ScrollView style={styles.content}>
                <Card glow>
                    <Text style={styles.title}>{reminder.title}</Text>
                    {reminder.description ? <Text style={styles.desc}>{reminder.description}</Text> : null}
                    <Text style={styles.time}>{formatDateTime(reminder.datetime)}</Text>
                    <Text style={styles.repeat}>Repeat: {reminder.repeat_type}</Text>
                    <Text style={styles.repeat}>Type: {reminder.reminder_type || 'time'}</Text>
                    {reminder.location_text ? <Text style={styles.repeat}>Location: {reminder.location_text}</Text> : null}
                    <Text style={styles.status}>{reminder.is_done ? 'Done' : 'Pending'}</Text>
                </Card>
                <View style={styles.actions}>
                    {!reminder.is_done ? <Button title="Snooze 15m" variant="ghost" onPress={() => { snooze(reminder.id, 15); navigation.goBack(); }} style={{ flex: 1 }} /> : null}
                    {!reminder.is_done ? <Button title="Mark Done" variant="secondary" onPress={() => { markDone(reminder.id); navigation.goBack(); }} style={{ flex: 1 }} /> : null}
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
    title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
    desc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
    time: { ...typography.body, color: colors.accent, marginBottom: spacing.xs },
    repeat: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
    status: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, paddingBottom: spacing.xxxl, flexWrap: 'wrap' },
});

export default ReminderDetailScreen;
