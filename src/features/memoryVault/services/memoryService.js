import db from '../../../core/database';
import { generateId } from '../../../shared/utils';

const memoryService = {
    async getAll() {
        return db.query('SELECT * FROM memories ORDER BY is_pinned DESC, created_at DESC');
    },

    async getById(id) {
        const rows = await db.query('SELECT * FROM memories WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async search(query) {
        const term = `%${query}%`;
        return db.query(
            `SELECT * FROM memories WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
       ORDER BY is_pinned DESC, created_at DESC`,
            [term, term, term],
        );
    },

    async getByTag(tag) {
        return db.query(
            `SELECT * FROM memories WHERE tags LIKE ? ORDER BY is_pinned DESC, created_at DESC`,
            [`%${tag}%`],
        );
    },

    async getPinned() {
        return db.query('SELECT * FROM memories WHERE is_pinned = 1 ORDER BY created_at DESC');
    },

    async getRandomPinned() {
        const pinned = await this.getPinned();
        if (pinned.length === 0) return null;
        return pinned[Math.floor(Math.random() * pinned.length)];
    },

    async create({ title, content, tags, is_locked, life_area }) {
        const id = generateId();
        const now = new Date().toISOString();
        const tagsStr = JSON.stringify(tags || []);
        await db.run(
            `INSERT INTO memories (id, title, content, tags, is_pinned, is_locked, life_area, created_at)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
            [id, title, content, tagsStr, is_locked ? 1 : 0, life_area || 'personal_growth', now],
        );
        return this.getById(id);
    },

    async update(id, fields) {
        const sets = [];
        const values = [];
        Object.entries(fields).forEach(([key, val]) => {
            if (key === 'tags') {
                sets.push('tags = ?');
                values.push(JSON.stringify(val));
            } else {
                sets.push(`${key} = ?`);
                values.push(val);
            }
        });
        values.push(id);
        await db.run(`UPDATE memories SET ${sets.join(', ')} WHERE id = ?`, values);
        return this.getById(id);
    },

    async togglePin(id) {
        const mem = await this.getById(id);
        if (!mem) return null;
        return this.update(id, { is_pinned: mem.is_pinned ? 0 : 1 });
    },

    async delete(id) {
        await db.run('DELETE FROM memories WHERE id = ?', [id]);
    },

    async getAllTags() {
        const rows = await db.query('SELECT tags FROM memories');
        const allTags = new Set();
        rows.forEach(r => {
            try {
                const tags = JSON.parse(r.tags || '[]');
                tags.forEach(t => allTags.add(t));
            } catch (e) { }
        });
        return [...allTags];
    },
};

export default memoryService;
