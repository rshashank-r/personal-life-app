import db from '../../../core/database';

const TABLES = [
    'tasks',
    'reminders',
    'trackers',
    'tracker_entries',
    'memories',
    'bucket_list',
    'forget_rules',
    'goals',
    'journal_entries',
];

const backupService = {
    async exportJson() {
        const data = {};
        for (const table of TABLES) {
            data[table] = await db.query(`SELECT * FROM ${table}`);
        }
        return JSON.stringify({
            exported_at: new Date().toISOString(),
            version: 2,
            data,
        });
    },

    async importJson(jsonString) {
        const parsed = JSON.parse(jsonString);
        const payload = parsed?.data || {};
        for (const table of TABLES) {
            if (!Array.isArray(payload[table])) continue;
            await db.run(`DELETE FROM ${table}`);
            for (const row of payload[table]) {
                const keys = Object.keys(row);
                const placeholders = keys.map(() => '?').join(', ');
                const values = keys.map((k) => row[k]);
                await db.run(
                    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
                    values,
                );
            }
        }
        return true;
    },
};

export default backupService;
