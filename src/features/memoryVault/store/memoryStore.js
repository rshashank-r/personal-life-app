import { create } from 'zustand';
import memoryService from '../services/memoryService';

const useMemoryStore = create((set, get) => ({
    memories: [],
    allTags: [],
    loading: false,
    searchQuery: '',
    selectedTag: null,

    loadAll: async () => {
        set({ loading: true });
        try {
            const query = get().searchQuery;
            const tag = get().selectedTag;
            let memories;
            if (query) {
                memories = await memoryService.search(query);
            } else if (tag) {
                memories = await memoryService.getByTag(tag);
            } else {
                memories = await memoryService.getAll();
            }
            const allTags = await memoryService.getAllTags();
            set({ memories, allTags, loading: false });
        } catch (e) {
            console.error('Failed to load memories:', e);
            set({ loading: false });
        }
    },

    addMemory: async (data) => {
        try {
            await memoryService.create(data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to add memory:', e);
        }
    },

    updateMemory: async (id, data) => {
        try {
            await memoryService.update(id, data);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to update memory:', e);
        }
    },

    togglePin: async (id) => {
        try {
            await memoryService.togglePin(id);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to toggle pin:', e);
        }
    },

    deleteMemory: async (id) => {
        try {
            await memoryService.delete(id);
            await get().loadAll();
        } catch (e) {
            console.error('Failed to delete memory:', e);
        }
    },

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedTag: (selectedTag) => set({ selectedTag }),
}));

export default useMemoryStore;
