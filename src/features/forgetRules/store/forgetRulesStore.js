import { create } from 'zustand';
import forgetRulesService from '../services/forgetRulesService';

const useForgetRulesStore = create((set, get) => ({
    rules: [],
    randomRule: null,
    loading: false,

    loadAll: async () => {
        set({ loading: true });
        try {
            const [rules, randomRule] = await Promise.all([
                forgetRulesService.getAll(),
                forgetRulesService.getRandomRule(),
            ]);
            set({ rules, randomRule, loading: false });
        } catch (e) {
            console.error('Failed to load forget rules:', e);
            set({ loading: false });
        }
    },

    addRule: async (data) => {
        try { await forgetRulesService.create(data); await get().loadAll(); }
        catch (e) { console.error('Failed to add rule:', e); }
    },

    updateRule: async (id, data) => {
        try { await forgetRulesService.update(id, data); await get().loadAll(); }
        catch (e) { console.error('Failed to update rule:', e); }
    },

    togglePin: async (id) => {
        try { await forgetRulesService.togglePin(id); await get().loadAll(); }
        catch (e) { console.error('Failed to toggle pin:', e); }
    },

    deleteRule: async (id) => {
        try { await forgetRulesService.delete(id); await get().loadAll(); }
        catch (e) { console.error('Failed to delete rule:', e); }
    },
}));

export default useForgetRulesStore;
