import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, CheckSquare, Bell, TrendingUp, MoreHorizontal } from 'lucide-react-native';
import { colors } from '../core/theme';

// Screens
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import TaskListScreen from '../features/tasks/screens/TaskListScreen';
import TaskDetailScreen from '../features/tasks/screens/TaskDetailScreen';
import ReminderListScreen from '../features/reminders/screens/ReminderListScreen';
import ReminderDetailScreen from '../features/reminders/screens/ReminderDetailScreen';
import TrackerListScreen from '../features/trackers/screens/TrackerListScreen';
import TrackerDetailScreen from '../features/trackers/screens/TrackerDetailScreen';
import MoreScreen from '../features/more/screens/MoreScreen';
import VaultListScreen from '../features/memoryVault/screens/VaultListScreen';
import VaultDetailScreen from '../features/memoryVault/screens/VaultDetailScreen';
import BucketListScreen from '../features/bucketList/screens/BucketListScreen';
import BucketDetailScreen from '../features/bucketList/screens/BucketDetailScreen';
import ForgetRulesScreen from '../features/forgetRules/screens/ForgetRulesScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import SmartSchedulerScreen from '../features/tasks/screens/SmartSchedulerScreen';
import TimelineScreen from '../features/timeline/screens/TimelineScreen';
import JournalScreen from '../features/journal/screens/JournalScreen';
import SearchScreen from '../features/search/screens/SearchScreen';
import GoalScreen from '../features/goals/screens/GoalScreen';
import FocusModeScreen from '../features/focus/screens/FocusModeScreen';
import HabitHeatmapScreen from '../features/trackers/screens/HabitHeatmapScreen';
import KnowledgeGraphScreen from '../features/memoryVault/screens/KnowledgeGraphScreen';
import YearlyReportScreen from '../features/dashboard/screens/YearlyReportScreen';
import AICompanionScreen from '../features/ai/screens/AICompanionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOpts = { headerShown: false, contentStyle: { backgroundColor: colors.background } };

function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={screenOpts}>
            <Stack.Screen name="DashboardHome" component={DashboardScreen} />
            <Stack.Screen name="Timeline" component={TimelineScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Scheduler" component={SmartSchedulerScreen} />
        </Stack.Navigator>
    );
}

function TasksStack() {
    return (
        <Stack.Navigator screenOptions={screenOpts}>
            <Stack.Screen name="TaskList" component={TaskListScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        </Stack.Navigator>
    );
}

function RemindersStack() {
    return (
        <Stack.Navigator screenOptions={screenOpts}>
            <Stack.Screen name="ReminderList" component={ReminderListScreen} />
            <Stack.Screen name="ReminderDetail" component={ReminderDetailScreen} />
        </Stack.Navigator>
    );
}

function TrackersStack() {
    return (
        <Stack.Navigator screenOptions={screenOpts}>
            <Stack.Screen name="TrackerList" component={TrackerListScreen} />
            <Stack.Screen name="TrackerDetail" component={TrackerDetailScreen} />
        </Stack.Navigator>
    );
}

function MoreStack() {
    return (
        <Stack.Navigator screenOptions={screenOpts}>
            <Stack.Screen name="MoreHome" component={MoreScreen} />
            <Stack.Screen name="VaultList" component={VaultListScreen} />
            <Stack.Screen name="VaultDetail" component={VaultDetailScreen} />
            <Stack.Screen name="BucketList" component={BucketListScreen} />
            <Stack.Screen name="BucketDetail" component={BucketDetailScreen} />
            <Stack.Screen name="ForgetRules" component={ForgetRulesScreen} />
            <Stack.Screen name="Timeline" component={TimelineScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Goals" component={GoalScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="FocusMode" component={FocusModeScreen} />
            <Stack.Screen name="Heatmap" component={HabitHeatmapScreen} />
            <Stack.Screen name="KnowledgeGraph" component={KnowledgeGraphScreen} />
            <Stack.Screen name="Scheduler" component={SmartSchedulerScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="YearlyReport" component={YearlyReportScreen} />
            <Stack.Screen name="AICompanion" component={AICompanionScreen} />
        </Stack.Navigator>
    );
}

const tabIcons = {
    Dashboard: LayoutDashboard,
    Tasks: CheckSquare,
    Reminders: Bell,
    Trackers: TrendingUp,
    More: MoreHorizontal,
};

export default function Navigation() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    const IconComponent = tabIcons[route.name];
                    return <IconComponent size={22} color={color} strokeWidth={focused ? 2.5 : 2} />;
                },
                tabBarActiveTintColor: colors.tabActive,
                tabBarInactiveTintColor: colors.tabInactive,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
            })}>
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Tasks" component={TasksStack} />
            <Tab.Screen name="Reminders" component={RemindersStack} />
            <Tab.Screen name="Trackers" component={TrackersStack} />
            <Tab.Screen name="More" component={MoreStack} />
        </Tab.Navigator>
    );
}
