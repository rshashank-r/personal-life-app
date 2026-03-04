import { create } from 'zustand';
import trackerService from '../services/trackerService';

const useTrackerStore = create((set, get) => ({
    trackers: [],
    todayStatus: [],
    loading: false,

    loadAll: async () => {
        set({ loading: true });
        try {
            const todayStatus = await trackerService.getAllTodayStatus();
            set({ trackers: todayStatus, todayStatus, loading: false });
        } catch (e) {
            console.error('Failed to load trackers:', e);
            set({ loading: false });
        }
    },

    addTracker: async (data) => {
        try {
            await trackerService.create(data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to add tracker:', e);
        }
    },

    updateTracker: async (id, data) => {
        try {
            await trackerService.update(id, data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to update tracker:', e);
        }
    },

    deleteTracker: async (id) => {
        try {
            await trackerService.delete(id);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to delete tracker:', e);
        }
    },

    logEntry: async (trackerId, date, value) => {
        try {
            await trackerService.logEntry(trackerId, date, value);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to log entry:', e);
        }
    },
}));

export default useTrackerStore;
