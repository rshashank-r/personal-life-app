import { create } from 'zustand';
import taskService from '../services/taskService';

const withCompletedFlag = (items = []) => items.map((t) => ({
    ...t,
    completed: t.status === 'completed',
}));

const useTaskStore = create((set, get) => ({
    tasks: [],
    todayTasks: [],
    upcomingTasks: [],
    somedayTasks: [],
    completedTasks: [],
    loading: false,
    filter: 'all', // all | high | medium | low

    loadAll: async () => {
        set({ loading: true });
        try {
            const [today, upcoming, someday, completed] = await Promise.all([
                taskService.getTodayDue(),
                taskService.getUpcoming(),
                taskService.getSomeday(),
                taskService.getCompleted(),
            ]);
            const todayTasks = withCompletedFlag(today);
            const upcomingTasks = withCompletedFlag(upcoming);
            const somedayTasks = withCompletedFlag(someday);
            const completedTasks = withCompletedFlag(completed);
            set({
                todayTasks,
                upcomingTasks,
                somedayTasks,
                completedTasks,
                tasks: [...todayTasks, ...upcomingTasks, ...somedayTasks, ...completedTasks],
                loading: false,
            });
        } catch (e) {
            console.error('Failed to load tasks:', e);
            set({ loading: false });
        }
    },

    addTask: async (data) => {
        try {
            await taskService.create(data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to add task:', e);
        }
    },

    updateTask: async (id, data) => {
        try {
            await taskService.update(id, data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to update task:', e);
        }
    },

    toggleComplete: async (id) => {
        try {
            await taskService.toggleComplete(id);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to toggle task:', e);
        }
    },

    // Backward compatibility for screens using toggleTask.
    toggleTask: async (id) => {
        await get().toggleComplete(id);
    },

    deleteTask: async (id) => {
        try {
            await taskService.delete(id);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to delete task:', e);
        }
    },

    setFilter: (filter) => set({ filter }),
}));

export default useTaskStore;
