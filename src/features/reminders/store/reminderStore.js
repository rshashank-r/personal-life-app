import { create } from 'zustand';
import reminderService from '../services/reminderService';

const useReminderStore = create((set, get) => ({
    upcoming: [],
    done: [],
    todayReminders: [],
    loading: false,

    loadAll: async () => {
        set({ loading: true });
        try {
            const [upcoming, done, today] = await Promise.all([
                reminderService.getUpcoming(),
                reminderService.getDone(),
                reminderService.getToday(),
            ]);
            set({ upcoming, done, todayReminders: today, loading: false });
        } catch (e) {
            console.error('Failed to load reminders:', e);
            set({ loading: false });
        }
    },

    addReminder: async (data) => {
        try {
            await reminderService.create(data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to add reminder:', e);
        }
    },

    updateReminder: async (id, data) => {
        try {
            await reminderService.update(id, data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to update reminder:', e);
        }
    },

    markDone: async (id) => {
        try {
            await reminderService.markDone(id);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to mark done:', e);
        }
    },

    snooze: async (id, minutes) => {
        try {
            await reminderService.snooze(id, minutes);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to snooze:', e);
        }
    },

    deleteReminder: async (id) => {
        try {
            await reminderService.delete(id);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to delete reminder:', e);
        }
    },
}));

export default useReminderStore;
