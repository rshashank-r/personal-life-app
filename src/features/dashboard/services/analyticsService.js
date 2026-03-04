import taskService from '../../tasks/services/taskService';
import trackerService from '../../trackers/services/trackerService';
import reminderService from '../../reminders/services/reminderService';
import { getToday } from '../../../shared/utils';

const startOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    now.setDate(now.getDate() + diff);
    now.setHours(0, 0, 0, 0);
    return now;
};

const analyticsService = {
    getWeekRange() {
        const start = startOfWeek();
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return {
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        };
    },

    async getWeeklyInsights() {
        const { startIso, endIso, startDate, endDate } = this.getWeekRange();
        const [completedTasks, allTodayTrackers, completedByDay] = await Promise.all([
            taskService.getCompletedInRange(startIso, endIso),
            trackerService.getAllTodayStatus(),
            taskService.getWeeklyCompletionByDay(startIso, endIso),
        ]);

        const habitSuccessRate = allTodayTrackers.length
            ? Math.round((allTodayTrackers.filter((t) => t.done).length / allTodayTrackers.length) * 100)
            : 0;
        const missedHabits = allTodayTrackers.filter((t) => !t.done).length;

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let bestDay = 'N/A';
        let bestCount = 0;
        completedByDay.forEach((item) => {
            const count = Number(item.count || 0);
            if (count > bestCount) {
                bestCount = count;
                bestDay = weekdays[new Date(item.day).getDay()];
            }
        });

        return {
            weekRange: { startDate, endDate },
            tasksCompleted: completedTasks.length,
            habitsSuccessRate: habitSuccessRate,
            topProductiveDay: bestDay,
            missedHabits,
        };
    },

    async getLifeHealthScore() {
        const today = getToday();
        const [todayTasks, todayTrackers, todaysReminders] = await Promise.all([
            taskService.getTodayAllDue(),
            trackerService.getAllTodayStatus(),
            reminderService.getTodayAll(),
        ]);

        const completedTasks = todayTasks.filter((task) => task.status === 'completed').length;
        const completedHabits = todayTrackers.filter((t) => t.done).length;
        const completedReminders = todaysReminders.filter((r) => r.is_done).length;

        // Calculate 0-100% individual scores
        const tasksPct = todayTasks.length ? Math.round((completedTasks / todayTasks.length) * 100) : 100;
        const habitsPct = todayTrackers.length ? Math.round((completedHabits / todayTrackers.length) * 100) : 100;
        const remindersPct = todaysReminders.length ? Math.round((completedReminders / todaysReminders.length) * 100) : 100;

        // Weighted Total (Tasks 40%, Habits 40%, Reminders 20%)
        const total = Math.round((tasksPct * 0.4) + (habitsPct * 0.4) + (remindersPct * 0.2));

        return {
            date: today,
            total,
            breakdown: {
                tasks: tasksPct,
                habits: habitsPct,
                reminders: remindersPct,
            },
        };
    },

    async getYearlyInsights(year = new Date().getFullYear()) {
        const startIso = `${year}-01-01T00:00:00.000Z`;
        const endIso = `${year}-12-31T23:59:59.999Z`;

        const [completedTasks, allTrackers, memories, completedByMonth] = await Promise.all([
            taskService.getCompletedInRange(startIso, endIso),
            trackerService.getAllTodayStatus(), // simplified for now since trackers don't have historical "goals" easily available without entries lookup
            import('../../memoryVault/services/memoryService').then(m => m.default.getAll()),
            import('../../tasks/services/taskService').then(t => t.default.query(`
                SELECT strftime('%m', updated_at) as month, count(*) as count 
                FROM tasks 
                WHERE status='completed' AND updated_at BETWEEN ? AND ? 
                GROUP BY month`, [startIso, endIso]))
        ]);

        // Fallback for habit success rate based on today
        const habitSuccessRate = allTrackers.length
            ? Math.round((allTrackers.filter((t) => t.done).length / allTrackers.length) * 100)
            : 0;

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let bestMonth = 'N/A';
        let bestCount = 0;

        if (completedByMonth && completedByMonth.length > 0) {
            completedByMonth.forEach((item) => {
                const count = Number(item.count || 0);
                if (count > bestCount) {
                    bestCount = count;
                    bestMonth = months[parseInt(item.month) - 1];
                }
            });
        }

        // Filter memories to just this year
        const memoriesThisYear = memories.filter(m => new Date(m.created_at).getFullYear() === year);

        return {
            year,
            tasksCompleted: completedTasks.length,
            habitsSuccessRate: habitSuccessRate,
            memoriesRecorded: memoriesThisYear.length,
            topProductiveMonth: bestMonth
        };
    }
};

export default analyticsService;
