import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, FAB, Modal, EmptyState, Card, Input, Button } from '../../../shared/components';
import useForgetRulesStore from '../store/forgetRulesStore';
import { colors, typography, spacing } from '../../../core/theme';

const ForgetRulesScreen = () => {
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState('');
    const [editingRule, setEditingRule] = useState(null);
    const [editContent, setEditContent] = useState('');
    const { rules, randomRule, loadAll, addRule, updateRule, togglePin, deleteRule } = useForgetRulesStore();

    useFocusEffect(useCallback(() => { loadAll(); }, []));

    const handleAdd = async () => {
        if (!content.trim()) return;
        await addRule({ content: content.trim() });
        setContent(''); setShowForm(false);
    };

    const handleDelete = (rule) => Alert.alert('Delete Rule', 'Delete this rule?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteRule(rule.id) },
    ]);

    const renderRule = ({ item }) => (
        <Card style={[styles.ruleCard, item.pinned && styles.pinned]}>
            <Text style={styles.ruleText}>{item.content}</Text>
            <View style={styles.ruleActions}>
                <TouchableOpacity onPress={() => togglePin(item.id)} style={styles.actionBtn}>
                    <MaterialCommunityIcons name={item.pinned ? 'pin' : 'pin-outline'} size={18} color={item.pinned ? colors.accent : colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditingRule(item); setEditContent(item.content); }} style={styles.actionBtn}>
                    <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
                </TouchableOpacity>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Header title="Forget Rules" subtitle="Remember what matters" />
            {randomRule && (
                <Card glow style={styles.randomCard}>
                    <Text style={styles.randomLabel}>TODAY'S REMINDER</Text>
                    <Text style={styles.randomText}>{randomRule.content}</Text>
                </Card>
            )}
            {rules.length === 0 ? <EmptyState icon="brain" title="No rules yet" message="Add personal discipline reminders" /> : (
                <FlatList data={rules} keyExtractor={i => i.id} renderItem={renderRule}
                    contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
            )}
            <FAB onPress={() => setShowForm(true)} />
            <Modal visible={showForm} onClose={() => setShowForm(false)} title="New Rule">
                <Input label="RULE" value={content} onChangeText={setContent} placeholder="What should you never forget?" multiline />
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    <Button title="Add Rule" onPress={handleAdd} disabled={!content.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
            <Modal visible={!!editingRule} onClose={() => setEditingRule(null)} title="Edit Rule">
                <Input label="RULE" value={editContent} onChangeText={setEditContent} multiline />
                <View style={styles.actions}>
                    <Button title="Cancel" variant="ghost" onPress={() => setEditingRule(null)} style={{ flex: 1 }} />
                    <Button title="Save" onPress={async () => { await updateRule(editingRule.id, { content: editContent.trim() }); setEditingRule(null); }} disabled={!editContent.trim()} style={{ flex: 2 }} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    randomCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
    randomLabel: { ...typography.label, color: colors.accent, marginBottom: spacing.sm },
    randomText: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
    ruleCard: { marginBottom: spacing.sm },
    pinned: { borderColor: 'rgba(0,212,255,0.15)' },
    ruleText: { ...typography.body, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.sm },
    ruleActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
    actionBtn: { padding: spacing.xs },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl },
});
export default ForgetRulesScreen;
