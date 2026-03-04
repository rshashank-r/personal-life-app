import React from 'react';
import { ProgressWidget } from './src/features/dashboard/widgets/ProgressWidget';
import taskService from './src/features/tasks/services/taskService';

export async function widgetTaskHandler(props) {
    const defaultData = { pendingCount: 0, completedCount: 0 };
    try {
        const pendingCount = await taskService.getPendingCount();
        const tasks = await taskService.getTodayDue();
        const completedCount = tasks.filter(t => t.status === 'completed').length;
        props.renderWidget(<ProgressWidget pendingCount={pendingCount} completedCount={completedCount} />);
    } catch (e) {
        console.error("Widget Task Error:", e);
        props.renderWidget(<ProgressWidget {...defaultData} />);
    }
}
