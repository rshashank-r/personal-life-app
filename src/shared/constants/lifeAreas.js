export const LIFE_AREAS = [
    { key: 'health', label: 'Health' },
    { key: 'career', label: 'Career' },
    { key: 'learning', label: 'Learning' },
    { key: 'finance', label: 'Finance' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'personal_growth', label: 'Personal Growth' },
];

export const LIFE_AREA_LABELS = LIFE_AREAS.reduce((acc, item) => {
    acc[item.key] = item.label;
    return acc;
}, {});
