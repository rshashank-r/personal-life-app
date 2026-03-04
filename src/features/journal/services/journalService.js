import db from '../../../core/database';
import { generateId, getToday } from '../../../shared/utils';

const journalService = {
    async getByDate(date = getToday()) {
        const rows = await db.query('SELECT * FROM journal_entries WHERE date = ?', [date]);
        return rows[0] || null;
    },

    async upsertByDate(date, fields) {
        const existing = await this.getByDate(date);
        const now = new Date().toISOString();
        if (!existing) {
            const id = generateId();
            await db.run(
                `INSERT INTO journal_entries (id, date, mood, learned, went_well, improve, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, date, fields.mood || '', fields.learned || '', fields.went_well || '', fields.improve || '', fields.notes || '', now, now],
            );
            return this.getByDate(date);
        }

        const sets = [];
        const values = [];
        Object.entries(fields).forEach(([key, value]) => {
            sets.push(`${key} = ?`);
            values.push(value || '');
        });
        sets.push('updated_at = ?');
        values.push(now);
        values.push(date);
        await db.run(`UPDATE journal_entries SET ${sets.join(', ')} WHERE date = ?`, values);
        return this.getByDate(date);
    },
};

export default journalService;
