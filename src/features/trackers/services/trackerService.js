import db from '../../../core/database';
import { generateId, getToday, getDateRange } from '../../../shared/utils';

const trackerService = {
    async getAll() {
        return db.query('SELECT * FROM trackers ORDER BY created_at DESC');
    },

    async getById(id) {
        const rows = await db.query('SELECT * FROM trackers WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create({ name, type, unit, target_value, life_area }) {
        const id = generateId();
        const now = new Date().toISOString();
        await db.run(
            'INSERT INTO trackers (id, name, type, unit, target_value, life_area, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, type || 'boolean', unit || '', target_value || null, life_area || 'health', now],
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
        await db.run(`UPDATE trackers SET ${sets.join(', ')} WHERE id = ?`, values);
        return this.getById(id);
    },

    async delete(id) {
        await db.run('DELETE FROM tracker_entries WHERE tracker_id = ?', [id]);
        await db.run('DELETE FROM trackers WHERE id = ?', [id]);
    },

    // Entries
    async getEntries(trackerId, days = 30) {
        const dates = getDateRange(days);
        const start = dates[0];
        const end = dates[dates.length - 1];
        return db.query(
            'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date >= ? AND date <= ? ORDER BY date ASC',
            [trackerId, start, end],
        );
    },

    async getTodayEntry(trackerId) {
        const today = getToday();
        const rows = await db.query(
            'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date = ?',
            [trackerId, today],
        );
        return rows[0] || null;
    },

    async logEntry(trackerId, date, value) {
        const existing = await db.query(
            'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date = ?',
            [trackerId, date],
        );

        if (existing.length > 0) {
            await db.run(
                'UPDATE tracker_entries SET value = ? WHERE tracker_id = ? AND date = ?',
                [value, trackerId, date],
            );
        } else {
            const id = generateId();
            await db.run(
                'INSERT INTO tracker_entries (id, tracker_id, date, value, created_at) VALUES (?, ?, ?, ?, ?)',
                [id, trackerId, date, value, new Date().toISOString()],
            );
        }
    },

    async deleteEntry(trackerId, date) {
        await db.run(
            'DELETE FROM tracker_entries WHERE tracker_id = ? AND date = ?',
            [trackerId, date],
        );
    },

    // Streak calculation
    async calculateStreak(trackerId) {
        const entries = await db.query(
            `SELECT date FROM tracker_entries WHERE tracker_id = ? AND value > 0
       ORDER BY date DESC`,
            [trackerId],
        );

        if (entries.length === 0) return { current: 0, longest: 0 };

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;
        const today = getToday();

        // Check if today or yesterday has an entry for current streak
        const dates = entries.map(e => e.date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dates[0] === today || dates[0] === yesterdayStr) {
            currentStreak = 1;
            for (let i = 1; i < dates.length; i++) {
                const prev = new Date(dates[i - 1]);
                const curr = new Date(dates[i]);
                const diff = (prev - curr) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            const diff = (prev - curr) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
    },

    async getStreak(trackerId) {
        return this.calculateStreak(trackerId);
    },

    // Weekly summary
    async getWeeklySummary(trackerId) {
        const dates = getDateRange(7);
        const entries = await db.query(
            'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date >= ? AND date <= ? ORDER BY date ASC',
            [trackerId, dates[0], dates[dates.length - 1]],
        );

        const summary = dates.map(date => {
            const entry = entries.find(e => e.date === date);
            return { date, value: entry ? entry.value : 0 };
        });

        const completed = summary.filter(s => s.value > 0).length;
        return {
            days: summary.map((item) => ({ ...item, label: item.date.slice(5) })),
            completionRate: Math.round((completed / 7) * 100),
            completed,
            total: 7,
        };
    },

    // Monthly summary
    async getMonthlySummary(trackerId) {
        const dates = getDateRange(30);
        const entries = await db.query(
            'SELECT * FROM tracker_entries WHERE tracker_id = ? AND date >= ? AND date <= ? ORDER BY date ASC',
            [trackerId, dates[0], dates[dates.length - 1]],
        );

        const summary = dates.map(date => {
            const entry = entries.find(e => e.date === date);
            return { date, value: entry ? entry.value : 0 };
        });

        const completed = summary.filter(s => s.value > 0).length;
        return { days: summary, completionRate: Math.round((completed / 30) * 100) };
    },

    // Get today's status for all trackers
    async getAllTodayStatus() {
        const today = getToday();
        const trackers = await this.getAll();
        const entries = await db.query(
            'SELECT * FROM tracker_entries WHERE date = ?',
            [today],
        );

        const withStreaks = await Promise.all(trackers.map(async (tracker) => {
            const entry = entries.find(e => e.tracker_id === tracker.id);
            const streak = await this.calculateStreak(tracker.id);
            return {
                ...tracker,
                todayValue: entry ? entry.value : 0,
                done: entry ? entry.value > 0 : false,
                streak: streak.current,
                bestStreak: streak.longest,
            };
        }));

        return withStreaks;
    },

    async getCompletionStatsByArea() {
        const today = getToday();
        return db.query(
            `SELECT t.life_area as life_area, COUNT(*) as total,
        SUM(CASE WHEN e.date = ? AND e.value > 0 THEN 1 ELSE 0 END) as completed
       FROM trackers t
       LEFT JOIN tracker_entries e ON e.tracker_id = t.id
       GROUP BY t.life_area`,
            [today],
        );
    },
};

export default trackerService;
