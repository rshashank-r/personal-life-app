import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, FAB, Modal, EmptyState, FilterChips, Card, Button, Input, Badge } from '../../../shared/components';
import useBucketStore from '../store/bucketStore';
import { colors, typography, spacing } from '../../../core/theme';
import { formatDate } from '../../../shared/utils';

const CATEGORIES = [
    { label: 'All', value: null }, { label: 'Skills', value: 'skills' }, { label: 'Career', value: 'career' },
    { label: 'Travel', value: 'travel' }, { label: 'Personal', value: 'personal' }, { label: 'Experience', value: 'experience' },
];
const catColors = { skills: colors.accent, career: colors.secondary, travel: colors.success, personal: colors.warning, experience: '#FF6B9D' };

const BucketItem = ({ item, onPress }) => (
    <Card onPress={onPress} style={[styles.card, item.completed && styles.completedCard]}>
        <View style={styles.row}>
            <MaterialCommunityIcons name={item.completed ? 'trophy' : 'star-outline'} size={20} color={item.completed ? colors.success : catColors[item.category] || colors.accent} />
            <Text style={[styles.title, item.completed && styles.completedTitle]} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={styles.meta}>
            <Badge label={item.category} color={catColors[item.category]} />
            {item.target_date ? <Text style={styles.date}>{formatDate(item.target_date)}</Text> : null}
        </View>
    </Card>
);

const BucketListScreen = ({ navigation }) => {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('personal');
    const [notes, setNotes] = useState('');
    const { items, progress, loadAll, addItem, selectedCategory, setCategory: setFilter } = useBucketStore();

    useFocusEffect(useCallback(() => { loadAll(); }, []));
    useEffect(() => { loadAll(); }, [selectedCategory]);

    const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

    const handleAdd = async () => {
        if (!title.trim()) return;
        await addItem({ title: title.trim(), category, notes: notes.trim() });
        setTitle(''); setNotes('');
        setShowForm(false);
    };

    return (
        <View style={styles.container}>
            <Header title="Bucket List" subtitle={`${progress.completed}/${progress.total} completed (${pct}%)`} />
            <FilterChips options={CATEGORIES} selected={selectedCategory} onSelect={setFilter} />
            {items.length === 0 ? <EmptyState icon="playlist-star" title="No bucket items" message="Add your dreams and goals" /> : (
                <FlatList data={items} keyExtractor={i => i.id}
                    renderItem={({ item }) => <BucketItem item={item} onPress={() => navigation.navigate('BucketDetail', { item })} />}
                    contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
            )}
            <FAB onPress={() => setShowForm(true)} />
            <Modal visible={showForm} onClose={() => setShowForm(false)} title="New Bucket Item">
                <Input label="TITLE" value={title} onChangeText={setTitle} placeholder="What's on your bucket list?" />
                <View style={styles.catRow}>
                    {['skills', 'career', 'travel', 'personal', 'experience'].map(c => (
                        <Button key={c} title={c.charAt(0).toUpperCase() + c.slice(1)} variant={category === c ? 'secondary' : 'ghost'} size="sm" onPress={() => setCategory(c)} style={styles.catBtn} />
                    ))}
                </View>
                <Input label="NOTES" value={notes} onChangeText={setNotes} placeholder="Optional details" multiline />
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    <Button title="Add" onPress={handleAdd} disabled={!title.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    card: { marginBottom: spacing.sm },
    completedCard: { opacity: 0.6 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    title: { ...typography.bodyBold, color: colors.textPrimary, flex: 1 },
    completedTitle: { textDecorationLine: 'line-through', color: colors.textMuted },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    date: { ...typography.caption, color: colors.textMuted },
    catRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg, flexWrap: 'wrap' },
    catBtn: { marginBottom: spacing.xs },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});
export default BucketListScreen;
