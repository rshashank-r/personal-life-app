import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Card } from '../../../shared/components';
import { colors, typography, spacing } from '../../../core/theme';

const menuItems = [
    { id: 'ai', title: 'AI Companion', subtitle: 'Chat & generated insights', icon: 'robot-outline', screen: 'AICompanion', color: colors.accent },
    { id: 'yearly_report', title: 'Yearly Life Report', subtitle: 'View your performance over the year', icon: 'chart-box-outline', screen: 'YearlyReport', color: colors.warning },
    { id: 'vault', title: 'Memory Vault', subtitle: 'Important memories & info', icon: 'safe-square-outline', screen: 'VaultList', color: colors.accent },
    { id: 'bucket', title: 'Bucket List', subtitle: 'Dreams & goals', icon: 'playlist-star', screen: 'BucketList', color: colors.secondary },
    { id: 'forget', title: 'Forget Rules', subtitle: 'Personal discipline reminders', icon: 'brain', screen: 'ForgetRules', color: colors.warning },
    { id: 'timeline', title: 'Life Timeline', subtitle: 'Daily activity history', icon: 'timeline-clock-outline', screen: 'Timeline', color: colors.accent },
    { id: 'journal', title: 'Daily Journal', subtitle: 'Mood and reflection', icon: 'notebook-edit-outline', screen: 'Journal', color: colors.secondary },
    { id: 'goals', title: 'Goals', subtitle: 'Long-term outcomes', icon: 'flag-checkered', screen: 'Goals', color: colors.warning },
    { id: 'search', title: 'Advanced Search', subtitle: 'Tags + full app search', icon: 'magnify', screen: 'Search', color: colors.accent },
    { id: 'focus', title: 'Focus Mode', subtitle: '25-minute timer', icon: 'timer-sand', screen: 'FocusMode', color: colors.secondary },
    { id: 'heatmap', title: 'Habit Heatmap', subtitle: 'Yearly consistency grid', icon: 'grid', screen: 'Heatmap', color: colors.warning },
    { id: 'knowledge', title: 'Knowledge Graph', subtitle: 'Linked memory ideas', icon: 'graph-outline', screen: 'KnowledgeGraph', color: colors.accent },
    { id: 'scheduler', title: 'Smart Scheduler', subtitle: 'Auto time blocking', icon: 'calendar-clock', screen: 'Scheduler', color: colors.secondary },
    { id: 'settings', title: 'Settings', subtitle: 'Backup, export, preferences', icon: 'cog-outline', screen: 'Settings', color: colors.textSecondary },
];

const MoreScreen = ({ navigation }) => (
    <View style={styles.container}>
        <Header title="More" />
        <ScrollView contentContainerStyle={styles.content}>
            {menuItems.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
                    <Card style={styles.menuCard}>
                        <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                            <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                        </View>
                        <View style={styles.menuText}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSub}>{item.subtitle}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                    </Card>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
    menuCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg },
    menuText: { flex: 1 },
    menuTitle: { ...typography.bodyBold, color: colors.textPrimary },
    menuSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
export default MoreScreen;
