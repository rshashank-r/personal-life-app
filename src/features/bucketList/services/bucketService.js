import db from '../../../core/database';
import { generateId } from '../../../shared/utils';

const CATEGORIES = ['skills', 'career', 'travel', 'personal', 'experience'];

const bucketService = {
    async getAll() {
        return db.query('SELECT * FROM bucket_list ORDER BY completed ASC, created_at DESC');
    },

    async getById(id) {
        const rows = await db.query('SELECT * FROM bucket_list WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async getByCategory(category) {
        return db.query(
            'SELECT * FROM bucket_list WHERE category = ? ORDER BY completed ASC, created_at DESC',
            [category],
        );
    },

    async getCompleted() {
        return db.query('SELECT * FROM bucket_list WHERE completed = 1 ORDER BY created_at DESC');
    },

    async getPending() {
        return db.query('SELECT * FROM bucket_list WHERE completed = 0 ORDER BY created_at DESC');
    },

    async create({ title, category, notes, target_date, life_area }) {
        const id = generateId();
        const now = new Date().toISOString();
        await db.run(
            `INSERT INTO bucket_list (id, title, category, notes, target_date, life_area, completed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
            [id, title, category || 'personal', notes || '', target_date || '', life_area || 'personal_growth', now],
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
        await db.run(`UPDATE bucket_list SET ${sets.join(', ')} WHERE id = ?`, values);
        return this.getById(id);
    },

    async markComplete(id, reflection) {
        await db.run(
            'UPDATE bucket_list SET completed = 1, completion_reflection = ? WHERE id = ?',
            [reflection || '', id],
        );
        return this.getById(id);
    },

    async delete(id) {
        await db.run('DELETE FROM bucket_list WHERE id = ?', [id]);
    },

    async getProgress() {
        const total = await db.query('SELECT COUNT(*) as count FROM bucket_list');
        const completed = await db.query('SELECT COUNT(*) as count FROM bucket_list WHERE completed = 1');
        return {
            total: total[0]?.count || 0,
            completed: completed[0]?.count || 0,
        };
    },

    getCategories() {
        return CATEGORIES;
    },
};

export default bucketService;
