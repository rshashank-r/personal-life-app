import taskService from '../../tasks/services/taskService';
import reminderService from '../../reminders/services/reminderService';
import trackerService from '../../trackers/services/trackerService';
import memoryService from '../../memoryVault/services/memoryService';
import { getToday } from '../../../shared/utils';

const timelineService = {
    async getTodayTimeline() {
        const today = getToday();
        const [tasks, reminders, trackers, memories] = await Promise.all([
            taskService.getTodayAllDue(),
            reminderService.getTodayAll(),
            trackerService.getAllTodayStatus(),
            memoryService.getAll(),
        ]);

        const items = [];
        tasks.filter((t) => t.status === 'completed').forEach((task) => {
            items.push({
                id: `task-${task.id}`,
                type: 'task',
                title: `Completed task: ${task.title}`,
                at: task.completed_at || task.updated_at || task.created_at,
                icon: 'check-circle',
            });
        });
        reminders.filter((r) => r.is_done).forEach((reminder) => {
            items.push({
                id: `rem-${reminder.id}`,
                type: 'reminder',
                title: `Reminder done: ${reminder.title}`,
                at: reminder.completed_at || reminder.datetime,
                icon: 'bell-check',
            });
        });
        trackers.filter((t) => t.done).forEach((tracker) => {
            items.push({
                id: `tracker-${tracker.id}`,
                type: 'tracker',
                title: `${tracker.name} completed`,
                at: today,
                icon: 'chart-line',
            });
        });
        memories.slice(0, 10).forEach((memory) => {
            if ((memory.created_at || '').startsWith(today)) {
                items.push({
                    id: `memory-${memory.id}`,
                    type: 'memory',
                    title: `Added memory: ${memory.title}`,
                    at: memory.created_at,
                    icon: 'safe-square-outline',
                });
            }
        });

        return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    },
};

export default timelineService;
