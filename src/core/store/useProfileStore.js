import { create } from 'zustand';
import db from '../database/DatabaseService';

const useProfileStore = create((set, get) => ({
    profile: null,
    settings: {},
    loading: true,

    loadProfile: async () => {
        try {
            set({ loading: true });

            // Fetch profile
            const profileRows = await db.query('SELECT * FROM user_profile LIMIT 1');
            const profile = profileRows.length > 0 ? profileRows[0] : null;

            // Fetch settings
            const settingsRows = await db.query('SELECT * FROM app_settings');
            const settings = {};
            settingsRows.forEach(row => {
                settings[row.key] = row.value;
            });

            set({ profile, settings, loading: false });
        } catch (error) {
            console.error('Error loading profile:', error);
            set({ loading: false });
        }
    },

    saveProfile: async (profileData) => {
        try {
            const { id, name, dob, priorities, daily_reflection_time } = profileData;
            const now = new Date().toISOString();

            await db.run(
                `INSERT OR REPLACE INTO user_profile (id, name, dob, priorities, daily_reflection_time, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id, name, dob,
                    JSON.stringify(priorities || []),
                    daily_reflection_time || null,
                    now
                ]
            );

            // Reload to update state
            await get().loadProfile();
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    },

    updateSetting: async (key, value) => {
        try {
            const now = new Date().toISOString();
            await db.run(
                `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
                [key, String(value), now]
            );

            set((state) => ({
                settings: { ...state.settings, [key]: value }
            }));
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    }
}));

export default useProfileStore;
