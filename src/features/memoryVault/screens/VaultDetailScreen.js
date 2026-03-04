import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Card, Button, Input } from '../../../shared/components';
import useMemoryStore from '../store/memoryStore';
import { colors, typography, spacing } from '../../../core/theme';
import { formatDate } from '../../../shared/utils';

const VaultDetailScreen = ({ route, navigation }) => {
    const { memory } = route.params;
    const { updateMemory, togglePin, deleteMemory } = useMemoryStore();
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(memory.title);
    const [content, setContent] = useState(memory.content);
    const [tagsInput, setTagsInput] = useState(
        (() => { try { return JSON.parse(memory.tags || '[]').join(', '); } catch { return ''; } })()
    );
    const tags = (() => { try { return JSON.parse(memory.tags || '[]'); } catch { return []; } })();

    const handleSave = async () => {
        const newTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        await updateMemory(memory.id, { title: title.trim(), content: content.trim(), tags: newTags });
        navigation.goBack();
    };
    const handleDelete = () => Alert.alert('Delete', `Delete "${memory.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteMemory(memory.id); navigation.goBack(); } },
    ]);

    if (editing) return (
        <View style={styles.container}>
            <Header title="Edit Memory" />
            <ScrollView style={styles.content}>
                <Input label="TITLE" value={title} onChangeText={setTitle} />
                <Input label="CONTENT" value={content} onChangeText={setContent} multiline />
                <Input label="TAGS" value={tagsInput} onChangeText={setTagsInput} placeholder="Comma separated" />
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                    <Button title="Save" onPress={handleSave} style={{ flex: 2 }} />
                </View>
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header title="Memory" />
            <ScrollView style={styles.content}>
                <Card glow={memory.is_pinned === 1}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{memory.title}</Text>
                        {memory.is_pinned === 1 && <MaterialCommunityIcons name="pin" size={18} color={colors.accent} />}
                    </View>
                    <Text style={styles.body}>{memory.content}</Text>
                    {tags.length > 0 && <View style={styles.tags}>{tags.map((t, i) => <Text key={i} style={styles.tag}>#{t}</Text>)}</View>}
                    <Text style={styles.date}>{formatDate(memory.created_at)}</Text>
                </Card>
                <View style={styles.actions}>
                    <Button title={memory.is_pinned ? 'Unpin' : 'Pin'} variant="secondary" onPress={() => { togglePin(memory.id); navigation.goBack(); }} style={{ flex: 1 }} />
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
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
    title: { ...typography.h2, color: colors.textPrimary, flex: 1 },
    body: { ...typography.body, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg },
    tags: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
    tag: { ...typography.caption, color: colors.accent },
    date: { ...typography.caption, color: colors.textMuted },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, paddingBottom: spacing.xxxl },
});
export default VaultDetailScreen;
