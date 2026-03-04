import * as SQLite from 'expo-sqlite';

const MIGRATIONS = [
    {
        version: 1,
        statements: [
            `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
        priority TEXT DEFAULT 'medium', due_date TEXT, category TEXT DEFAULT 'general',
        status TEXT DEFAULT 'pending', sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
        datetime TEXT NOT NULL, repeat_type TEXT DEFAULT 'none',
        repeat_interval TEXT, snoozed_until TEXT, is_done INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS trackers (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT 'boolean',
        unit TEXT, target_value REAL, created_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS tracker_entries (
        id TEXT PRIMARY KEY, tracker_id TEXT NOT NULL, value REAL NOT NULL,
        date TEXT NOT NULL, created_at TEXT NOT NULL,
        FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
      )`,
            `CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
        tags TEXT DEFAULT '[]', is_pinned INTEGER DEFAULT 0,
        is_locked INTEGER DEFAULT 0, created_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS bucket_list (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT DEFAULT 'personal',
        notes TEXT, target_date TEXT, completed INTEGER DEFAULT 0,
        completion_reflection TEXT, created_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS forget_rules (
        id TEXT PRIMARY KEY, content TEXT NOT NULL,
        pinned INTEGER DEFAULT 0, created_at TEXT NOT NULL
      )`,
            'CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
            'CREATE INDEX IF NOT EXISTS idx_reminders_at ON reminders(datetime)',
            'CREATE INDEX IF NOT EXISTS idx_tracker_entries_date ON tracker_entries(date)',
            'CREATE INDEX IF NOT EXISTS idx_tracker_entries_tracker ON tracker_entries(tracker_id)',
        ],
    },
    {
        version: 2,
        statements: [
            'ALTER TABLE tasks ADD COLUMN duration_minutes INTEGER DEFAULT 30',
            "ALTER TABLE tasks ADD COLUMN life_area TEXT DEFAULT 'personal_growth'",
            'ALTER TABLE tasks ADD COLUMN completed_at TEXT',
            "ALTER TABLE reminders ADD COLUMN reminder_type TEXT DEFAULT 'time'",
            'ALTER TABLE reminders ADD COLUMN location_text TEXT',
            "ALTER TABLE reminders ADD COLUMN life_area TEXT DEFAULT 'personal_growth'",
            'ALTER TABLE reminders ADD COLUMN completed_at TEXT',
            "ALTER TABLE trackers ADD COLUMN life_area TEXT DEFAULT 'health'",
            "ALTER TABLE memories ADD COLUMN life_area TEXT DEFAULT 'personal_growth'",
            "ALTER TABLE bucket_list ADD COLUMN life_area TEXT DEFAULT 'personal_growth'",
            "ALTER TABLE forget_rules ADD COLUMN life_area TEXT DEFAULT 'personal_growth'",
            `CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        notes TEXT,
        deadline TEXT,
        progress REAL DEFAULT 0,
        life_area TEXT DEFAULT 'personal_growth',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        mood TEXT,
        learned TEXT,
        went_well TEXT,
        improve TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
            'CREATE INDEX IF NOT EXISTS idx_tasks_life_area ON tasks(life_area)',
            'CREATE INDEX IF NOT EXISTS idx_reminders_life_area ON reminders(life_area)',
            'CREATE INDEX IF NOT EXISTS idx_trackers_life_area ON trackers(life_area)',
            'CREATE INDEX IF NOT EXISTS idx_goals_life_area ON goals(life_area)',
            'CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date)',
        ],
    },
    {
        version: 3,
        statements: [
            `CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        dob TEXT,
        priorities TEXT,
        daily_reflection_time TEXT,
        created_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS daily_reflections (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        mood TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
            `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
            'CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(date)',
        ],
    },
    {
        version: 4,
        statements: [
            `CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        author TEXT,
        created_at TEXT NOT NULL
      )`,
            `INSERT OR IGNORE INTO quotes (id, content, author, created_at) VALUES 
        ('q1', 'Discipline equals freedom.', 'Jocko Willink', datetime('now')),
        ('q2', 'Small steps every day lead to big results.', 'Unknown', datetime('now')),
        ('q3', 'What gets measured gets managed.', 'Peter Drucker', datetime('now'))`
        ],
    },
];

let _db = null;

const db = {
    async getDB() {
        if (_db) return _db;
        _db = await SQLite.openDatabaseAsync('personal_life.db');
        await this.runMigrations();
        return _db;
    },

    async runMigrations() {
        for (const migration of MIGRATIONS) {
            for (const sql of migration.statements) {
                try {
                    await _db.execAsync(sql);
                } catch (error) {
                    // Ignore duplicate-column migration attempts on existing installs.
                    if (!String(error?.message || '').toLowerCase().includes('duplicate column')) {
                        throw error;
                    }
                }
            }
        }
    },

    async query(sql, params = []) {
        const database = await this.getDB();
        const result = await database.getAllAsync(sql, params);
        return result;
    },

    async run(sql, params = []) {
        const database = await this.getDB();
        const result = await database.runAsync(sql, params);
        return result;
    },
};

export default db;
