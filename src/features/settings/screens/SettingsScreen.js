import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Header, Card, Button, Input } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import { db } from '../../../core/database';
import backupService from '../services/backupService';
import useProfileStore from '../../../core/store/useProfileStore';

const SettingsScreen = () => {
    const { settings, updateSetting } = useProfileStore();

    const [backupJson, setBackupJson] = useState('');
    const [showBackup, setShowBackup] = useState(false);
    const [groqKey, setGroqKey] = useState(settings?.groq_api_key || '');
    const [isSavingKey, setIsSavingKey] = useState(false);

    const [customName, setCustomName] = useState(settings?.custom_app_name || '');
    const [customLogo, setCustomLogo] = useState(settings?.custom_app_logo || null);

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCustomLogo(result.assets[0].uri);
            updateSetting('custom_app_logo', result.assets[0].uri);
        }
    };

    const handleSaveName = async () => {
        await updateSetting('custom_app_name', customName);
        Alert.alert('Saved', 'Custom App Name updated successfully.');
    };

    const handleSaveGroqKey = async () => {
        setIsSavingKey(true);
        await updateSetting('groq_api_key', groqKey);
        setIsSavingKey(false);
        Alert.alert('Saved', 'Groq API Key saved successfully.');
    };

    const handleClear = () => {
        Alert.alert('Clear All Data', 'This permanently deletes ALL data. Cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete Everything',
                style: 'destructive',
                onPress: async () => {
                    const tables = ['tasks', 'reminders', 'trackers', 'tracker_entries', 'memories', 'bucket_list', 'forget_rules', 'goals', 'journal_entries'];
                    for (const table of tables) {
                        await db.run(`DELETE FROM ${table}`);
                    }
                    Alert.alert('Done', 'All data cleared.');
                },
            },
        ]);
    };

    const handleExport = async () => {
        const json = await backupService.exportJson();
        setBackupJson(json);
        setShowBackup(true);
    };

    const handleImport = async () => {
        try {
            await backupService.importJson(backupJson);
            Alert.alert('Restore complete', 'Backup imported successfully.');
        } catch (error) {
            Alert.alert('Import failed', 'Backup JSON is invalid.');
        }
    };



    return (
        <View style={styles.container}>
            <Header title="Settings" />
            <ScrollView style={styles.content}>
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>AI CONFIGURATION</Text>
                    <Input
                        label="GROQ API KEY"
                        value={groqKey}
                        onChangeText={setGroqKey}
                        placeholder="gsk_..."
                        secureTextEntry
                    />
                    <Button
                        title={isSavingKey ? "Saving..." : "Save API Key"}
                        onPress={handleSaveGroqKey}
                        disabled={isSavingKey}
                        style={{ marginTop: spacing.sm }}
                    />
                </Card>
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>APP APPEARANCE</Text>
                    <Input
                        label="CUSTOM APP NAME"
                        value={customName}
                        onChangeText={setCustomName}
                        placeholder="e.g. My Workspace"
                    />
                    <Button title="Save Name" variant="secondary" onPress={handleSaveName} style={styles.btn} />

                    <View style={styles.logoRow}>
                        <Text style={styles.toggleTitle}>Custom App Logo</Text>
                        <Button title={customLogo ? "Change Logo" : "Select Logo"} onPress={handlePickImage} variant="secondary" />
                    </View>
                    {customLogo && (
                        <View style={styles.previewContainer}>
                            <Text style={styles.previewText}>Preview:</Text>
                            <View style={styles.logoPreviewBadge}>
                                <Text style={{ color: colors.background, fontWeight: 'bold' }}>Logo Selected</Text>
                            </View>
                            <Button title="Clear Logo" variant="danger" onPress={() => { setCustomLogo(null); updateSetting('custom_app_logo', ''); }} style={{ marginTop: 8 }} />
                        </View>
                    )}
                </Card>
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>BACKUP & RESTORE</Text>
                    <Button title="Export JSON Backup" onPress={handleExport} style={styles.btn} />
                    {showBackup ? (
                        <Input
                            label="BACKUP JSON"
                            value={backupJson}
                            onChangeText={setBackupJson}
                            multiline
                            placeholder="Backup JSON appears here. You can also paste to restore."
                        />
                    ) : null}
                    <Button title="Import JSON Backup" variant="secondary" onPress={handleImport} disabled={!backupJson.trim()} />
                </Card>
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>DATA</Text>
                    <Button title="Clear All Data" variant="danger" onPress={handleClear} style={styles.btn} />
                </Card>
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>ABOUT</Text>
                    <Text style={styles.info}>Personal Life App v1.0.0</Text>
                    <Text style={styles.info}>Offline-first | No cloud | No tracking</Text>
                    <Text style={styles.info}>Built with Expo + SQLite</Text>
                </Card>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    section: { marginBottom: spacing.lg },
    sectionTitle: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.md },
    btn: { marginBottom: spacing.sm },
    info: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.xs },
    toggleTextContainer: { flex: 1, paddingRight: spacing.md },
    toggleTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
    toggleSub: { ...typography.caption, color: colors.textSecondary },
    logoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
    previewContainer: { marginTop: spacing.sm, padding: spacing.sm, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 },
    previewText: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
    logoPreviewBadge: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.accent, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
});
export default SettingsScreen;
