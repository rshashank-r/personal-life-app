import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card } from '../../../shared/components';
import memoryService from '../services/memoryService';
import { colors, spacing, typography } from '../../../core/theme';

const KnowledgeGraphScreen = () => {
    const [links, setLinks] = useState([]);

    useFocusEffect(useCallback(() => {
        (async () => {
            const memories = await memoryService.getAll();
            const edges = [];
            memories.forEach((memory) => {
                let tags = [];
                try {
                    tags = JSON.parse(memory.tags || '[]');
                } catch (e) { }
                tags.forEach((tag) => {
                    edges.push(`${memory.title} -> #${tag}`);
                });
            });
            setLinks(edges.slice(0, 40));
        })();
    }, []));

    return (
        <View style={styles.container}>
            <Header title="Knowledge Graph" subtitle="Memory links by tags" />
            <ScrollView contentContainerStyle={styles.content}>
                {links.length === 0 ? (
                    <Card><Text style={styles.empty}>Add tagged memories to build graph links.</Text></Card>
                ) : links.map((edge, idx) => (
                    <Card key={idx} style={styles.card}><Text style={styles.edge}>{edge}</Text></Card>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
    card: { marginBottom: spacing.sm },
    empty: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
    edge: { ...typography.body, color: colors.textPrimary },
});

export default KnowledgeGraphScreen;
