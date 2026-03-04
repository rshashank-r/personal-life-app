import db from '../../../core/database';
import { generateId } from '../../../shared/utils';

const forgetRulesService = {
    async getAll() {
        return db.query('SELECT * FROM forget_rules ORDER BY pinned DESC, created_at DESC');
    },

    async getById(id) {
        const rows = await db.query('SELECT * FROM forget_rules WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async getPinned() {
        return db.query('SELECT * FROM forget_rules WHERE pinned = 1 ORDER BY created_at DESC');
    },

    async getRandomRule() {
        const rules = await this.getAll();
        if (rules.length === 0) return null;
        return rules[Math.floor(Math.random() * rules.length)];
    },

    async create({ content, life_area }) {
        const id = generateId();
        const now = new Date().toISOString();
        await db.run(
            'INSERT INTO forget_rules (id, content, pinned, life_area, created_at) VALUES (?, ?, 0, ?, ?)',
            [id, content, life_area || 'personal_growth', now],
        );
        return this.getById(id);
    },

    async update(id, fields) {
        const sets = [];
        const values = [];
        Object.entries(fields).forEach(([key, val]) => {
            sets.push(`${key} = ?`);
            values.push(val);
        });
        values.push(id);
        await db.run(`UPDATE forget_rules SET ${sets.join(', ')} WHERE id = ?`, values);
        return this.getById(id);
    },

    async togglePin(id) {
        const rule = await this.getById(id);
        if (!rule) return null;
        return this.update(id, { pinned: rule.pinned ? 0 : 1 });
    },

    async delete(id) {
        await db.run('DELETE FROM forget_rules WHERE id = ?', [id]);
    },
};

export default forgetRulesService;
