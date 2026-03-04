import db from '../database/DatabaseService';

export const motivationService = {
    async getRandomQuote() {
        const rows = await db.query('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1');
        return rows[0] || null;
    },

    getDailyMotivation(pendingTasksCount, tasksCompleted, habitsCompleted, totalHabits) {
        if (tasksCompleted > 0 && pendingTasksCount === 0) {
            return `Great job! You completed all ${tasksCompleted} tasks today.`;
        }

        if (tasksCompleted >= 5) {
            return `You are on fire! ${tasksCompleted} tasks completed today!`;
        }

        if (totalHabits > 0 && habitsCompleted === totalHabits) {
            return `Perfect habit day! You nailed all ${totalHabits} habits.`;
        }

        if (habitsCompleted >= 3) {
            return `🔥 ${habitsCompleted} habits crushed today! Keep going!`;
        }

        if (pendingTasksCount > 0) {
            return `Small steps every day lead to big results. Let's finish a task!`;
        }

        return "Ready to win the day?";
    }
};

export default motivationService;
