import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TrendingUp, Check, Plus, CheckCircle2, Circle, Flame, Trophy } from 'lucide-react-native';
import { Header, FAB, Modal, EmptyState, Card, Button, Input } from '../../../shared/components';
import useTrackerStore from '../store/trackerStore';
import { colors, typography, spacing } from '../../../core/theme';
import { LIFE_AREAS, LIFE_AREA_LABELS } from '../../../shared/constants/lifeAreas';

const TrackerItem = ({ tracker, onPress, onCheck }) => (
    <Card onPress={onPress} style={styles.card}>
        <View style={styles.headerRow}>
            <View style={styles.titleInfo}>
                <Text style={styles.name}>{tracker.name}</Text>
                <Text style={styles.goalText}>
                    {tracker.type === 'boolean' ? 'Daily check-in Goal' : `${tracker.target_value} ${tracker.unit || ''} Goal`}
                </Text>
            </View>
            <TouchableOpacity onPress={onCheck} style={[styles.checkButton, tracker.done && styles.checkButtonDone]}>
                {tracker.done ? (
                    <Check size={20} color={colors.success} />
                ) : (
                    <Plus size={20} color={colors.textPrimary} />
                )}
            </TouchableOpacity>
        </View>

        <View style={styles.statusRow}>
            {tracker.done ? (
                <View style={styles.completedBadge}>
                    <CheckCircle2 size={16} color={colors.success} />
                    <Text style={styles.completedText}>Today Completed</Text>
                </View>
            ) : (
                <View style={styles.pendingBadge}>
                    <Circle size={16} color={colors.textSecondary} />
                    <Text style={styles.pendingText}>Pending Today</Text>
                </View>
            )}
        </View>

        <View style={styles.streakRow}>
            <View style={styles.streakItem}>
                <Flame size={18} color={colors.warning} />
                <Text style={styles.streakText}>Streak: {tracker.streak || 0} days</Text>
            </View>
            <View style={styles.streakItem}>
                <Trophy size={18} color={colors.textSecondary} />
                <Text style={styles.bestText}>Best: {tracker.bestStreak || 0} days</Text>
            </View>
        </View>
    </Card>
);

const TrackerListScreen = ({ navigation }) => {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('boolean');
    const [unit, setUnit] = useState('');
    const [target, setTarget] = useState('');
    const [lifeArea, setLifeArea] = useState('health');
    const { trackers, loadAll, addTracker, toggleTracker } = useTrackerStore();

    useFocusEffect(useCallback(() => { loadAll(); }, []));

    const handleAdd = async () => {
        if (!name.trim()) return;
        await addTracker({
            name: name.trim(),
            type,
            unit: unit.trim(),
            target_value: target ? parseFloat(target) : null,
            life_area: lifeArea,
        });
        setName('');
        setType('boolean');
        setUnit('');
        setTarget('');
        setLifeArea('health');
        setShowForm(false);
    };

    const handleToggle = (item) => {
        if (!item.done) {
            toggleTracker(item.id, Number(item.target_value || 1));
        } else {
            // Depending on the toggle logic, here we just assume it flips
            toggleTracker(item.id, 0); // Reverse if supported
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Trackers" subtitle={`${trackers.filter((t) => t.done).length}/${trackers.length} done today`} />
            {trackers.length === 0 ? (
                <EmptyState icon="chart-line" title="No trackers" message="Track habits, goals, and metrics" customIcon={<TrendingUp size={48} color={colors.textMuted} />} />
            ) : (
                <FlatList
                    data={trackers}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <TrackerItem
                            tracker={item}
                            onCheck={() => handleToggle(item)}
                            onPress={() => navigation.navigate('TrackerDetail', { tracker: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <FAB onPress={() => setShowForm(true)} />
            <Modal visible={showForm} onClose={() => setShowForm(false)} title="New Tracker">
                <Input label="NAME" value={name} onChangeText={setName} placeholder="e.g. Meditate, Water intake" />
                <View style={styles.typeRow}>
                    <Button title="Yes/No" variant={type === 'boolean' ? 'secondary' : 'ghost'} onPress={() => setType('boolean')} style={{ flex: 1 }} />
                    <Button title="Numeric" variant={type === 'numeric' ? 'secondary' : 'ghost'} onPress={() => setType('numeric')} style={{ flex: 1 }} />
                </View>
                {type === 'numeric' ? (
                    <>
                        <Input label="UNIT" value={unit} onChangeText={setUnit} placeholder="e.g. ml, minutes, km" />
                        <Input label="DAILY TARGET" value={target} onChangeText={setTarget} placeholder="e.g. 2000" keyboardType="numeric" />
                    </>
                ) : null}
                <View style={styles.areaRow}>
                    {LIFE_AREAS.slice(0, 3).map((area) => (
                        <Button
                            key={area.key}
                            title={area.label}
                            size="sm"
                            variant={lifeArea === area.key ? 'secondary' : 'ghost'}
                            onPress={() => setLifeArea(area.key)}
                            style={{ flex: 1 }}
                        />
                    ))}
                </View>
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    <Button title="Create" onPress={handleAdd} disabled={!name.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.sm },

    // Card Layout
    card: {
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: 16
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md
    },
    titleInfo: {
        flex: 1
    },
    name: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: 4
    },
    goalText: {
        ...typography.body,
        color: colors.textSecondary
    },
    checkButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border
    },
    checkButtonDone: {
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        borderColor: colors.success
    },

    // Status Row
    statusRow: {
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
    },
    completedText: {
        ...typography.bodyBold,
        color: colors.success
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
    },
    pendingText: {
        ...typography.body,
        color: colors.textSecondary
    },

    // Streak Row
    streakRow: {
        flexDirection: 'row',
        gap: spacing.xl
    },
    streakItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs
    },
    streakText: {
        ...typography.body,
        color: colors.warning,
        fontWeight: '600'
    },
    bestText: {
        ...typography.body,
        color: colors.textSecondary
    },

    // Modal
    typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    areaRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});

export default TrackerListScreen;
