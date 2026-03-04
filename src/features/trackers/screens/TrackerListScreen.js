import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, FAB, Modal, EmptyState, Card, Button, Input } from '../../../shared/components';
import useTrackerStore from '../store/trackerStore';
import { colors, typography, spacing } from '../../../core/theme';
import { LIFE_AREAS, LIFE_AREA_LABELS } from '../../../shared/constants/lifeAreas';

const TrackerItem = ({ tracker, onPress }) => (
    <Card onPress={onPress} style={styles.card}>
        <View style={styles.row}>
            <MaterialCommunityIcons
                name={tracker.done ? 'check-circle' : 'circle-outline'}
                size={22}
                color={tracker.done ? colors.success : colors.textMuted}
            />
            <View style={styles.content}>
                <Text style={styles.name}>{tracker.name}</Text>
                <Text style={styles.meta}>
                    {tracker.type === 'boolean' ? 'Daily check-in' : `Target: ${tracker.target_value} ${tracker.unit || ''}`}
                </Text>
                <Text style={styles.meta}>{LIFE_AREA_LABELS[tracker.life_area] || 'Personal Growth'}</Text>
            </View>
            <View style={styles.streak}>
                <MaterialCommunityIcons name="fire" size={14} color={colors.warning} />
                <Text style={styles.streakText}>{tracker.streak || 0}</Text>
                <Text style={styles.bestText}>Best {tracker.bestStreak || 0}</Text>
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
    const { trackers, loadAll, addTracker } = useTrackerStore();

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

    return (
        <View style={styles.container}>
            <Header title="Trackers" subtitle={`${trackers.filter((t) => t.done).length}/${trackers.length} done today`} />
            {trackers.length === 0 ? (
                <EmptyState icon="chart-line" title="No trackers" message="Track habits, goals, and metrics" />
            ) : (
                <FlatList
                    data={trackers}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => <TrackerItem tracker={item} onPress={() => navigation.navigate('TrackerDetail', { tracker: item })} />}
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
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    card: { marginBottom: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    content: { flex: 1 },
    name: { ...typography.bodyBold, color: colors.textPrimary },
    meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    streak: {
        alignItems: 'flex-end',
        backgroundColor: 'rgba(251,191,36,0.1)',
        borderRadius: 12,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    streakText: { ...typography.caption, color: colors.warning, fontWeight: '700' },
    bestText: { ...typography.caption, color: colors.textSecondary, fontSize: 10, marginTop: 2 },
    typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    areaRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});

export default TrackerListScreen;
