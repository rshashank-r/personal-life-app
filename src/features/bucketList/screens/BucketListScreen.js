import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Trophy, Star, Target, CheckCircle2 } from 'lucide-react-native';
import { Header, FAB, Modal, EmptyState, FilterChips, Card, Button, Input, Badge } from '../../../shared/components';
import useBucketStore from '../store/bucketStore';
import { colors, typography, spacing } from '../../../core/theme';
import { formatDate } from '../../../shared/utils';

const CATEGORIES = [
    { label: 'All', value: null }, { label: 'Skills', value: 'skills' }, { label: 'Career', value: 'career' },
    { label: 'Travel', value: 'travel' }, { label: 'Personal', value: 'personal' }, { label: 'Experience', value: 'experience' },
];

const catColors = { skills: colors.accent, career: colors.secondary, travel: colors.success, personal: colors.warning, experience: '#FF6B9D' };

const BucketItem = ({ item, onPress }) => {
    // Determine progress mock if no specific progress mechanism exists in the store
    const progress = item.completed ? 100 : 0;

    return (
        <Card onPress={onPress} style={[styles.card, item.completed && styles.completedCard]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.title, item.completed && styles.completedTitle]} numberOfLines={1}>{item.title}</Text>
                {item.completed ? (
                    <Trophy size={20} color={colors.success} />
                ) : (
                    <Target size={20} color={catColors[item.category] || colors.accent} />
                )}
            </View>

            <View style={styles.categoryRow}>
                <Badge label={item.category} color={catColors[item.category]} />
                {item.target_date ? <Text style={styles.date}>{formatDate(item.target_date)}</Text> : null}
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress: {progress}%</Text>
                    {item.completed && <CheckCircle2 size={16} color={colors.success} />}
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: item.completed ? colors.success : colors.accent }]} />
                </View>
            </View>
        </Card>
    );
};

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

            {items.length === 0 ? (
                <EmptyState icon="star" title="No goals yet" message="Add your dreams and aspirations" />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={i => i.id}
                    renderItem={({ item }) => <BucketItem item={item} onPress={() => navigation.navigate('BucketDetail', { item })} />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <FAB onPress={() => setShowForm(true)} />

            <Modal visible={showForm} onClose={() => setShowForm(false)} title="New Goal">
                <Input label="TITLE" value={title} onChangeText={setTitle} placeholder="What do you want to achieve?" />
                <View style={styles.catRow}>
                    {['skills', 'career', 'travel', 'personal', 'experience'].map(c => (
                        <Button
                            key={c}
                            title={c.charAt(0).toUpperCase() + c.slice(1)}
                            variant={category === c ? 'secondary' : 'ghost'}
                            size="sm"
                            onPress={() => setCategory(c)}
                            style={styles.catBtn}
                        />
                    ))}
                </View>
                <Input label="NOTES" value={notes} onChangeText={setNotes} placeholder="How will you achieve this?" multiline />
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    <Button title="Add Goal" onPress={handleAdd} disabled={!title.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.sm },

    card: {
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: 16
    },
    completedCard: { opacity: 0.7 },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
        flex: 1,
        paddingRight: spacing.md
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: colors.textMuted
    },

    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg
    },
    date: {
        ...typography.caption,
        color: colors.textSecondary
    },

    progressSection: {
        marginTop: spacing.xs
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs
    },
    progressLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600'
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3
    },

    catRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg, flexWrap: 'wrap' },
    catBtn: { marginBottom: spacing.xs },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});

export default BucketListScreen;
