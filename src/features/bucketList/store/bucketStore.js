import { create } from 'zustand';
import bucketService from '../services/bucketService';

const useBucketStore = create((set, get) => ({
    items: [],
    progress: { total: 0, completed: 0 },
    loading: false,
    selectedCategory: null,

    loadAll: async () => {
        set({ loading: true });
        try {
            const cat = get().selectedCategory;
            const items = cat
                ? await bucketService.getByCategory(cat)
                : await bucketService.getAll();
            const progress = await bucketService.getProgress();
            set({ items, progress, loading: false });
        } catch (e) {
            console.error('Failed to load bucket list:', e);
            set({ loading: false });
        }
    },

    addItem: async (data) => {
        try { await bucketService.create(data); await get().loadAll(); }
        catch (e) { console.error('Failed to add bucket item:', e); }
    },

    updateItem: async (id, data) => {
        try { await bucketService.update(id, data); await get().loadAll(); }
        catch (e) { console.error('Failed to update bucket item:', e); }
    },

    markComplete: async (id, reflection) => {
        try { await bucketService.markComplete(id, reflection); await get().loadAll(); }
        catch (e) { console.error('Failed to complete bucket item:', e); }
    },

    deleteItem: async (id) => {
        try { await bucketService.delete(id); await get().loadAll(); }
        catch (e) { console.error('Failed to delete bucket item:', e); }
    },

    setCategory: (selectedCategory) => set({ selectedCategory }),
}));

export default useBucketStore;
