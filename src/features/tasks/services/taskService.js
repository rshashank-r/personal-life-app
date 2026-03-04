import db from '../../../core/database';
import { generateId } from '../../../shared/utils';

const taskService = {
    async getAll() {
        return db.query(
            'SELECT * FROM tasks ORDER BY sort_order ASC, created_at DESC',
        );
    },

    async getByStatus(status) {
        return db.query(
            'SELECT * FROM tasks WHERE status = ? ORDER BY sort_order ASC, created_at DESC',
            [status],
        );
    },

    async getToday() {
        const today = new Date().toISOString().split('T')[0];
        return db.query(
            `SELECT * FROM tasks WHERE (due_date LIKE ? OR due_date IS NULL OR due_date = '')
       AND status = 'pending' ORDER BY sort_order ASC, created_at DESC`,
            [`${today}%`],
        );
    },

    async getTodayDue() {
        const today = new Date().toISOString().split('T')[0];
        return db.query(
            `SELECT * FROM tasks WHERE due_date LIKE ? AND status = 'pending'
       ORDER BY sort_order ASC`,
            [`${today}%`],
        );
    },

    async getTodayAllDue() {
        const today = new Date().toISOString().split('T')[0];
        return db.query(
            `SELECT * FROM tasks WHERE due_date LIKE ?
       ORDER BY sort_order ASC`,
            [`${today}%`],
        );
    },

    async getUpcoming() {
        const today = new Date().toISOString().split('T')[0];
        return db.query(
            `SELECT * FROM tasks WHERE due_date > ? AND status = 'pending'
       ORDER BY due_date ASC`,
            [today],
        );
    },

    async getSomeday() {
        return db.query(
            `SELECT * FROM tasks WHERE (due_date IS NULL OR due_date = '')
       AND status = 'pending' ORDER BY sort_order ASC, created_at DESC`,
        );
    },

    async getCompleted() {
        return db.query(
            `SELECT * FROM tasks WHERE status = 'completed'
       ORDER BY updated_at DESC LIMIT 50`,
        );
    },

    async getById(id) {
        const rows = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create({ title, description, priority, due_date, duration_minutes, life_area }) {
        const id = generateId();
        const now = new Date().toISOString();
        await db.run(
            `INSERT INTO tasks (id, title, description, priority, due_date, duration_minutes, life_area, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
            [
                id,
                title,
                description || '',
                priority || 'medium',
                due_date || '',
                duration_minutes || 30,
                life_area || 'personal_growth',
                now,
                now,
            ],
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
        sets.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        await db.run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, values);
        return this.getById(id);
    },

    async toggleComplete(id) {
        const task = await this.getById(id);
        if (!task) return null;
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return this.update(id, {
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        });
    },

    async delete(id) {
        await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    },

    async getByPriority(priority) {
        return db.query(
            `SELECT * FROM tasks WHERE priority = ? AND status = 'pending'
       ORDER BY sort_order ASC`,
            [priority],
        );
    },

    async getPendingCount() {
        const rows = await db.query(
            "SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'",
        );
        return rows[0]?.count || 0;
    },

    async getCompletedInRange(startDate, endDate) {
        return db.query(
            `SELECT * FROM tasks
       WHERE status = 'completed'
       AND completed_at IS NOT NULL
       AND completed_at >= ?
       AND completed_at <= ?`,
            [startDate, endDate],
        );
    },

    async getWeeklyCompletionByDay(startDate, endDate) {
        return db.query(
            `SELECT substr(completed_at, 1, 10) as day, COUNT(*) as count
       FROM tasks
       WHERE status = 'completed' AND completed_at >= ? AND completed_at <= ?
       GROUP BY substr(completed_at, 1, 10)`,
            [startDate, endDate],
        );
    },

    async suggestSchedule(tasks = [], startHour = 7) {
        let pointer = startHour * 60;
        const sorted = [...tasks].sort((a, b) => {
            const priorityWeight = { high: 0, medium: 1, low: 2 };
            const p = (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3);
            if (p !== 0) return p;
            return (a.due_date || '').localeCompare(b.due_date || '');
        });

        return sorted.map((task) => {
            const mins = Math.max(15, Number(task.duration_minutes || 30));
            const hh = String(Math.floor(pointer / 60)).padStart(2, '0');
            const mm = String(pointer % 60).padStart(2, '0');
            const suggestion = `${hh}:${mm}`;
            pointer += mins;
            return {
                ...task,
                suggested_time: suggestion,
                suggested_range: `${suggestion} - ${String(Math.floor(pointer / 60)).padStart(2, '0')}:${String(pointer % 60).padStart(2, '0')}`,
            };
        });
    },
};

export default taskService;
