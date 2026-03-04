import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Header, Card, Button, Input, Badge } from '../../../shared/components';
import useBucketStore from '../store/bucketStore';
import { colors, typography, spacing } from '../../../core/theme';
import { formatDate } from '../../../shared/utils';

const catColors = { skills: colors.accent, career: '#A855F7', travel: '#34D399', personal: '#FBBF24', experience: '#FF6B9D' };

const BucketDetailScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const { updateItem, markComplete, deleteItem } = useBucketStore();
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [notes, setNotes] = useState(item.notes || '');
    const [reflection, setReflection] = useState('');
    const [showReflection, setShowReflection] = useState(false);

    const handleSave = async () => {
        await updateItem(item.id, { title: title.trim(), notes: notes.trim() });
        navigation.goBack();
    };
    const handleDelete = () => Alert.alert('Delete', `Delete "${item.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteItem(item.id); navigation.goBack(); } },
    ]);

    if (showReflection) return (
        <View style={styles.container}>
            <Header title="Completion Reflection" />
            <ScrollView style={styles.content}>
                <Card glow>
                    <Text style={styles.reflectionPrompt}>Congratulations! 🎉{'\n'}How did it feel completing "{item.title}"?</Text>
                    <Input label="YOUR REFLECTION" value={reflection} onChangeText={setReflection} placeholder="Share your thoughts..." multiline />
                    <View style={styles.actions}>
                        <Button title="Skip" variant="ghost" onPress={async () => { await markComplete(item.id, ''); navigation.goBack(); }} style={{ flex: 1 }} />
                        <Button title="Save & Complete" onPress={async () => { await markComplete(item.id, reflection); navigation.goBack(); }} style={{ flex: 2 }} />
                    </View>
                </Card>
            </ScrollView>
        </View>
    );

    if (editing) return (
        <View style={styles.container}>
            <Header title="Edit" />
            <ScrollView style={styles.content}>
                <Input label="TITLE" value={title} onChangeText={setTitle} />
                <Input label="NOTES" value={notes} onChangeText={setNotes} multiline />
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                    <Button title="Save" onPress={handleSave} style={{ flex: 2 }} />
                </View>
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header title="Bucket Item" />
            <ScrollView style={styles.content}>
                <Card glow={!item.completed}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Badge label={item.category} color={catColors[item.category]} style={{ marginBottom: spacing.md }} />
                    {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
                    {item.target_date ? <Text style={styles.date}>Target: {formatDate(item.target_date)}</Text> : null}
                    <Text style={styles.status}>{item.completed ? '✓ Completed' : '○ Pending'}</Text>
                    {item.completion_reflection ? (
                        <View style={styles.reflBox}>
                            <Text style={styles.reflLabel}>REFLECTION</Text>
                            <Text style={styles.reflText}>{item.completion_reflection}</Text>
                        </View>
                    ) : null}
                </Card>
                <View style={styles.actions}>
                    {!item.completed && <Button title="Complete ✓" variant="secondary" onPress={() => setShowReflection(true)} style={{ flex: 1 }} />}
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
    notes: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
    date: { ...typography.caption, color: colors.accent, marginBottom: spacing.xs },
    status: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
    reflBox: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceLight, borderRadius: 12 },
    reflLabel: { ...typography.label, color: colors.accent, marginBottom: spacing.xs },
    reflText: { ...typography.body, color: colors.textSecondary },
    reflectionPrompt: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xl, lineHeight: 28 },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, paddingBottom: spacing.xxxl },
});
export default BucketDetailScreen;
