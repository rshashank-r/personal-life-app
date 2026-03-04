import db from '../../../core/database/DatabaseService';
import { generateId, getToday } from '../../../shared/utils';

const reflectionService = {
    async getByDate(date = getToday()) {
        const rows = await db.query('SELECT * FROM daily_reflections WHERE date = ?', [date]);
        return rows[0] || null;
    },

    async upsertByDate(date, mood, note) {
        const existing = await this.getByDate(date);
        const now = new Date().toISOString();
        if (!existing) {
            const id = generateId();
            await db.run(
                `INSERT INTO daily_reflections (id, date, mood, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
                [id, date, mood, note, now, now]
            );
            return this.getByDate(date);
        }
        await db.run(
            `UPDATE daily_reflections SET mood = ?, note = ?, updated_at = ? WHERE date = ?`,
            [mood, note, now, date]
        );
        return this.getByDate(date);
    },

    async getReflectionHistory() {
        return await db.query('SELECT * FROM daily_reflections ORDER BY date DESC');
    }
};

export default reflectionService;
