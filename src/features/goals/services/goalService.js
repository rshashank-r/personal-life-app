import db from '../../../core/database';
import { generateId } from '../../../shared/utils';

const goalService = {
    async getAll() {
        return db.query('SELECT * FROM goals ORDER BY updated_at DESC');
    },

    async create({ title, notes, deadline, progress, life_area }) {
        const id = generateId();
        const now = new Date().toISOString();
        await db.run(
            `INSERT INTO goals (id, title, notes, deadline, progress, life_area, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, notes || '', deadline || '', progress || 0, life_area || 'personal_growth', now, now],
        );
    },

    async update(id, fields) {
        const sets = [];
        const values = [];
        Object.entries(fields).forEach(([key, value]) => {
            sets.push(`${key} = ?`);
            values.push(value);
        });
        sets.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        await db.run(`UPDATE goals SET ${sets.join(', ')} WHERE id = ?`, values);
    },

    async delete(id) {
        await db.run('DELETE FROM goals WHERE id = ?', [id]);
    },
};

export default goalService;
