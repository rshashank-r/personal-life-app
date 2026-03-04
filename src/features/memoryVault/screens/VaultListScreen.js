import React, { useState, useCallback } from 'react';
import { View, FlatList, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, FAB, Modal, EmptyState, FilterChips, Card, Input, Button } from '../../../shared/components';
import useMemoryStore from '../store/memoryStore';
import { colors, typography, spacing } from '../../../core/theme';
import { formatDate } from '../../../shared/utils';

const MemoryItem = ({ memory, onPress }) => {
    const tags = (() => { try { return JSON.parse(memory.tags || '[]'); } catch { return []; } })();
    return (
        <Card onPress={onPress} style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>{memory.title}</Text>
                {memory.is_pinned === 1 && <MaterialCommunityIcons name="pin" size={16} color={colors.accent} />}
            </View>
            <Text style={styles.preview} numberOfLines={2}>{memory.content}</Text>
            <View style={styles.footer}>
                <View style={styles.tags}>{tags.slice(0, 3).map((t, i) => <Text key={i} style={styles.tag}>#{t}</Text>)}</View>
                <Text style={styles.date}>{formatDate(memory.created_at)}</Text>
            </View>
        </Card>
    );
};

const VaultListScreen = ({ navigation }) => {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const { memories, allTags, loadAll, addMemory, searchQuery, setSearchQuery, selectedTag, setSelectedTag } = useMemoryStore();

    useFocusEffect(useCallback(() => { loadAll(); }, []));

    const tagOptions = [{ label: 'All', value: null }, ...allTags.map(t => ({ label: `#${t}`, value: t }))];

    const handleAdd = async () => {
        if (!title.trim() || !content.trim()) return;
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        await addMemory({ title: title.trim(), content: content.trim(), tags, is_locked: false });
        setTitle(''); setContent(''); setTagsInput('');
        setShowForm(false);
    };

    return (
        <View style={styles.container}>
            <Header title="Memory Vault" subtitle={`${memories.length} memories`} />
            <View style={styles.searchRow}>
                <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput style={styles.searchInput} value={searchQuery} onChangeText={q => { setSearchQuery(q); loadAll(); }}
                    placeholder="Search memories..." placeholderTextColor={colors.textMuted} />
            </View>
            {allTags.length > 0 && <FilterChips options={tagOptions} selected={selectedTag} onSelect={t => { setSelectedTag(t); loadAll(); }} />}
            {memories.length === 0 ? <EmptyState icon="safe-square-outline" title="Vault is empty" message="Store important memories here" /> : (
                <FlatList data={memories} keyExtractor={i => i.id}
                    renderItem={({ item }) => <MemoryItem memory={item} onPress={() => navigation.navigate('VaultDetail', { memory: item })} />}
                    contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
            )}
            <FAB onPress={() => setShowForm(true)} />
            <Modal visible={showForm} onClose={() => setShowForm(false)} title="New Memory">
                <Input label="TITLE" value={title} onChangeText={setTitle} placeholder="Memory title" />
                <Input label="CONTENT" value={content} onChangeText={setContent} placeholder="What to remember?" multiline />
                <Input label="TAGS" value={tagsInput} onChangeText={setTagsInput} placeholder="work, idea, learning" />
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    <Button title="Save" onPress={handleAdd} disabled={!title.trim() || !content.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
    searchIcon: { marginRight: spacing.sm },
    searchInput: { flex: 1, color: colors.textPrimary, ...typography.body, paddingVertical: spacing.md },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    card: { marginBottom: spacing.sm },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    title: { ...typography.bodyBold, color: colors.textPrimary, flex: 1 },
    preview: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tags: { flexDirection: 'row', gap: spacing.sm },
    tag: { ...typography.caption, color: colors.accent },
    date: { ...typography.caption, color: colors.textMuted },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});

export default VaultListScreen;
