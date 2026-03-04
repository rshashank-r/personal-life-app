import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header, Input, Card, Button } from '../../../shared/components';
import { colors, spacing, typography } from '../../../core/theme';
import searchService from '../services/searchService';

const SearchScreen = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const runSearch = async () => {
        const data = await searchService.searchAll(query);
        setResults(data);
    };

    return (
        <View style={styles.container}>
            <Header title="Search" subtitle="Tasks, habits, memories, bucket, rules" />
            <ScrollView contentContainerStyle={styles.content}>
                <Input label="SEARCH" value={query} onChangeText={setQuery} placeholder="Try #learning, gym, startup" />
                <Button title="Search" onPress={runSearch} disabled={!query.trim()} />
                {results.length === 0 ? (
                    <Card style={styles.card}>
                        <Text style={styles.empty}>No results yet.</Text>
                    </Card>
                ) : results.map((item) => (
                    <Card key={`${item.type}-${item.id}`} style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.meta}>{item.type.toUpperCase()} {item.subtitle ? `| ${item.subtitle}` : ''}</Text>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
    card: { marginTop: spacing.sm },
    empty: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
    title: { ...typography.bodyBold, color: colors.textPrimary },
    meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});

export default SearchScreen;
