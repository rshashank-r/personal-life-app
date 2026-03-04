import taskService from '../../tasks/services/taskService';
import reminderService from '../../reminders/services/reminderService';
import memoryService from '../../memoryVault/services/memoryService';
import bucketService from '../../bucketList/services/bucketService';
import forgetRulesService from '../../forgetRules/services/forgetRulesService';
import trackerService from '../../trackers/services/trackerService';

const contains = (value, term) => String(value || '').toLowerCase().includes(term.toLowerCase());

const searchService = {
    async searchAll(query) {
        const term = query.trim();
        if (!term) return [];
        const [tasks, reminders, memories, bucketItems, rules, trackers] = await Promise.all([
            taskService.getAll(),
            reminderService.getAll(),
            memoryService.getAll(),
            bucketService.getAll(),
            forgetRulesService.getAll(),
            trackerService.getAll(),
        ]);

        const matchesTag = term.startsWith('#');
        const tagTerm = matchesTag ? term.slice(1).toLowerCase() : null;

        return [
            ...tasks.filter((item) => contains(item.title, term) || contains(item.description, term)).map((item) => ({ id: item.id, type: 'task', title: item.title, subtitle: item.description || item.priority })),
            ...reminders.filter((item) => contains(item.title, term) || contains(item.description, term)).map((item) => ({ id: item.id, type: 'reminder', title: item.title, subtitle: item.datetime })),
            ...memories.filter((item) => {
                if (matchesTag) return contains(item.tags, tagTerm);
                return contains(item.title, term) || contains(item.content, term) || contains(item.tags, term);
            }).map((item) => ({ id: item.id, type: 'memory', title: item.title, subtitle: item.tags })),
            ...bucketItems.filter((item) => contains(item.title, term) || contains(item.notes, term)).map((item) => ({ id: item.id, type: 'bucket', title: item.title, subtitle: item.category })),
            ...rules.filter((item) => contains(item.content, term)).map((item) => ({ id: item.id, type: 'rule', title: item.content, subtitle: 'Forget Rule' })),
            ...trackers.filter((item) => contains(item.name, term)).map((item) => ({ id: item.id, type: 'tracker', title: item.name, subtitle: item.type })),
        ];
    },
};

export default searchService;
