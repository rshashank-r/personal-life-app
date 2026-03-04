import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { checkForPermission, showUsageAccessSettings, queryAndAggregateUsageStats } from '@brighthustle/react-native-usage-stats-manager';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';
import { useFocusEffect } from '@react-navigation/native';

// Fallback friendly names for common packages
const APP_NAMES = {
    'com.whatsapp': 'WhatsApp',
    'com.instagram.android': 'Instagram',
    'com.google.android.youtube': 'YouTube',
    'com.zhiliaoapp.musically': 'TikTok',
    'com.twitter.android': 'X (Twitter)',
    'com.facebook.katana': 'Facebook',
    'com.snapchat.android': 'Snapchat',
    'com.android.chrome': 'Chrome',
    'com.google.android.googlequicksearchbox': 'Google',
    'com.netflix.mediaclient': 'Netflix',
    'com.spotify.music': 'Spotify',
    'com.reddit.frontpage': 'Reddit',
    'com.discord': 'Discord'
};

const formatTime = (ms) => {
    if (!ms) return '0m';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const getFriendlyName = (pkg) => {
    return APP_NAMES[pkg] || pkg.split('.').pop() || pkg;
};

const ScreenTimeTracker = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    const checkPermissionAndLoad = async () => {
        if (Platform.OS !== 'android') return;

        try {
            const hasPerm = await checkForPermission();
            setHasPermission(hasPerm);

            if (hasPerm) {
                loadStats();
            }
        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkPermissionAndLoad();
        }, [])
    );

    const loadStats = async () => {
        setLoading(true);
        try {
            // Get today's stats
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const endOfDay = now.getTime();

            const rawData = await queryAndAggregateUsageStats(startOfDay, endOfDay);

            // rawData could be an object map or array. 
            // Most implementations return an object map of packageName -> stats or array of stats.
            const statsArray = Array.isArray(rawData) ? rawData : (Object.values(rawData || {}));

            // Filter to remove system apps and sort by totalTimeInForeground
            const validStats = statsArray.filter(s => s.totalTimeInForeground > 60000 && s.packageName !== 'com.personallife.app'); // > 1 minute

            validStats.sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);

            setStats(validStats.slice(0, 5)); // Top 5
        } catch (error) {
            console.error("Screen Time Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGrantPermission = () => {
        showUsageAccessSettings('com.personallife.app');
        Alert.alert('Permission needed', 'Please enable Usage Access for PersonalLifeApp in the settings screen that just opened, then return here.', [
            { text: 'OK' }
        ]);
    };

    if (Platform.OS !== 'android') {
        return null;
    }

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <MaterialCommunityIcons name="cellphone-check" size={24} color={colors.accent} />
                    <Text style={styles.title}>Screen Time Overview</Text>
                </View>
                {hasPermission && (
                    <TouchableOpacity onPress={loadStats}>
                        <MaterialCommunityIcons name="refresh" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {!hasPermission ? (
                <View style={styles.permissionBox}>
                    <Text style={styles.permissionText}>Enable usage access to see your daily screen time stats and identify distractions.</Text>
                    <TouchableOpacity style={styles.btn} onPress={handleGrantPermission}>
                        <Text style={styles.btnText}>Grant Access</Text>
                    </TouchableOpacity>
                </View>
            ) : loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator color={colors.accent} />
                </View>
            ) : stats.length === 0 ? (
                <Text style={styles.emptyText}>No screen time data recorded yet today.</Text>
            ) : (
                <View style={styles.list}>
                    {stats.map((app, i) => (
                        <View key={i} style={styles.appRow}>
                            <View style={styles.appInfo}>
                                <View style={styles.appRank}>
                                    <Text style={styles.rankText}>{i + 1}</Text>
                                </View>
                                <Text style={styles.appName} numberOfLines={1}>{getFriendlyName(app.packageName)}</Text>
                            </View>
                            <Text style={styles.appTime}>{formatTime(app.totalTimeInForeground)}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: spacing.lg, padding: 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...typography.bodyBold, color: colors.textPrimary },
    permissionBox: { padding: spacing.lg, alignItems: 'center' },
    permissionText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
    btn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8 },
    btnText: { ...typography.bodyBold, color: colors.background },
    loadingBox: { padding: spacing.xl, alignItems: 'center' },
    emptyText: { ...typography.caption, color: colors.textMuted, textAlign: 'center', padding: spacing.lg },
    list: { padding: spacing.sm },
    appRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
    appInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    appRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(52,211,153,0.1)', alignItems: 'center', justifyContent: 'center' },
    rankText: { ...typography.caption, color: colors.accent, fontWeight: 'bold' },
    appName: { ...typography.body, color: colors.textPrimary, flex: 1, textTransform: 'capitalize' },
    appTime: { ...typography.bodyBold, color: colors.textSecondary }
});

export default ScreenTimeTracker;
