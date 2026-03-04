import taskService from '../../features/tasks/services/taskService';
import memoryService from '../../features/memoryVault/services/memoryService';
import trackerService from '../../features/trackers/services/trackerService';

const GENTLE_REMINDERS = [
    { type: 'gentle', message: 'Take a sip of water.', icon: 'water-outline' },
    { type: 'gentle', message: 'Stretch your legs for 2 minutes.', icon: 'human-handsup' },
    { type: 'gentle', message: 'Rest your eyes from the screen.', icon: 'eye-outline' },
    { type: 'gentle', message: 'Take 3 deep breaths.', icon: 'weather-windy' },
    { type: 'gentle', message: 'Check your posture.', icon: 'chair-rolling' }
];

export const suggestionService = {
    async getSuggestions() {
        const suggestions = [];

        // 1. Gentle Reminder (Always add 1 random)
        const randomReminder = GENTLE_REMINDERS[Math.floor(Math.random() * GENTLE_REMINDERS.length)];
        suggestions.push(randomReminder);

        // 2. Smart Suggestion: Memories
        try {
            const memories = await memoryService.getAll();
            if (memories.length === 0) {
                suggestions.push({
                    type: 'smart',
                    message: "You haven't added a memory yet. Record something important today!",
                    icon: 'brain',
                    action: { screen: 'More', params: { screen: 'VaultList' } }
                });
            } else {
                const latestMemory = memories[0];
                const daysSince = Math.round((new Date() - new Date(latestMemory.created_at)) / (1000 * 60 * 60 * 24));
                if (daysSince >= 5) {
                    suggestions.push({
                        type: 'smart',
                        message: `You haven't added a memory in ${daysSince} days. What happened recently?`,
                        icon: 'brain',
                        action: { screen: 'More', params: { screen: 'VaultList' } }
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }

        // 3. Smart Suggestion: Overdue Tasks
        try {
            const tasks = await taskService.getTodayAllDue();
            const overdue = tasks.filter(t => t.status !== 'completed' && new Date(t.due_date) < new Date());
            if (overdue.length > 0) {
                suggestions.push({
                    type: 'smart',
                    message: `You have ${overdue.length} overdue tasks waiting. Let's tackle them!`,
                    icon: 'calendar-alert',
                    action: { screen: 'Tasks' }
                });
            }
        } catch (e) {
            console.error(e);
        }

        return suggestions;
    }
};

export default suggestionService;
