import db from '../../../core/database';
import { generateId } from '../../../shared/utils';
import notificationService from '../../../core/notifications';

const reminderService = {
    async getAll() {
        return db.query(
            'SELECT * FROM reminders ORDER BY datetime ASC',
        );
    },

    async getUpcoming() {
        return db.query(
            `SELECT * FROM reminders WHERE is_done = 0
       ORDER BY datetime ASC`,
        );
    },

    async getToday() {
        const today = new Date().toISOString().split('T')[0];
        return db.query(
            `SELECT * FROM reminders WHERE datetime LIKE ? AND is_done = 0
       ORDER BY datetime ASC`,
            [`${today}%`],
        );
    },

    async getTodayAll() {
        const today = new Date().toISOString().split('T')[0];
        return db.query(
            `SELECT * FROM reminders WHERE datetime LIKE ?
       ORDER BY datetime ASC`,
            [`${today}%`],
        );
    },

    async getDone() {
        return db.query(
            'SELECT * FROM reminders WHERE is_done = 1 ORDER BY datetime DESC LIMIT 50',
        );
    },

    async getById(id) {
        const rows = await db.query('SELECT * FROM reminders WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create({ title, description, datetime, repeat_type, repeat_interval, reminder_type, location_text, life_area }) {
        const id = generateId();
        const now = new Date().toISOString();
        await db.run(
            `INSERT INTO reminders (id, title, description, datetime, repeat_type, repeat_interval, reminder_type, location_text, life_area, is_done, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [id, title, description || '', datetime, repeat_type || 'none', repeat_interval || null, reminder_type || 'time', location_text || '', life_area || 'personal_growth', now],
        );

        // Schedule notification
        try {
            const ts = new Date(datetime).getTime();
            if (ts > Date.now()) {
                if (repeat_type && repeat_type !== 'none') {
                    await notificationService.scheduleRecurringNotification({
                        id,
                        title,
                        body: description || 'Reminder',
                        timestamp: ts,
                        repeatFrequency: repeat_type,
                    });
                } else {
                    await notificationService.scheduleNotification({
                        id,
                        title,
                        body: description || 'Reminder',
                        timestamp: ts,
                    });
                }
            }
        } catch (e) {
            console.warn('Failed to schedule notification:', e);
        }

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
        await db.run(`UPDATE reminders SET ${sets.join(', ')} WHERE id = ?`, values);

        // Reschedule notification if datetime changed
        if (fields.datetime) {
            try {
                await notificationService.cancelNotification(id);
                const reminder = await this.getById(id);
                const ts = new Date(fields.datetime).getTime();
                if (ts > Date.now() && !reminder.is_done) {
                    await notificationService.scheduleNotification({
                        id,
                        title: reminder.title,
                        body: reminder.description || 'Reminder',
                        timestamp: ts,
                    });
                }
            } catch (e) {
                console.warn('Failed to reschedule notification:', e);
            }
        }

        return this.getById(id);
    },

    async markDone(id) {
        await db.run('UPDATE reminders SET is_done = 1, completed_at = ? WHERE id = ?', [new Date().toISOString(), id]);
        try {
            await notificationService.cancelNotification(id);
        } catch (e) { }
    },

    async snooze(id, minutes = 15) {
        const snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
        await db.run(
            'UPDATE reminders SET snoozed_until = ?, datetime = ? WHERE id = ?',
            [snoozedUntil, snoozedUntil, id],
        );

        try {
            await notificationService.cancelNotification(id);
            const reminder = await this.getById(id);
            await notificationService.scheduleNotification({
                id,
                title: reminder.title,
                body: reminder.description || 'Snoozed reminder',
                timestamp: new Date(snoozedUntil).getTime(),
            });
        } catch (e) {
            console.warn('Failed to snooze notification:', e);
        }
    },

    async delete(id) {
        await db.run('DELETE FROM reminders WHERE id = ?', [id]);
        try {
            await notificationService.cancelNotification(id);
        } catch (e) { }
    },

    async getUpcomingCount() {
        const rows = await db.query(
            'SELECT COUNT(*) as count FROM reminders WHERE is_done = 0',
        );
        return rows[0]?.count || 0;
    },

    async getCompletedInRange(startDate, endDate) {
        return db.query(
            `SELECT * FROM reminders
       WHERE is_done = 1
       AND completed_at IS NOT NULL
       AND completed_at >= ? AND completed_at <= ?`,
            [startDate, endDate],
        );
    },
};

export default reminderService;
