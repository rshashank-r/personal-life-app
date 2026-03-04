import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const notificationService = {
    async init() {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted');
            }
        } catch (e) {
            console.log('Notifications init error:', e);
        }
    },

    async scheduleNotification(inputTitle, inputBody, inputTriggerDate) {
        try {
            const payload = typeof inputTitle === 'object'
                ? inputTitle
                : { title: inputTitle, body: inputBody, timestamp: new Date(inputTriggerDate).getTime() };
            const trigger = new Date(payload.timestamp);
            if (trigger <= new Date()) return null;
            const id = await Notifications.scheduleNotificationAsync({
                content: { title: payload.title, body: payload.body, sound: true },
                trigger: { type: 'date', date: trigger },
            });
            return id;
        } catch (e) {
            console.log('Schedule notification error:', e);
            return null;
        }
    },

    async scheduleRecurringNotification({ title, body, timestamp, repeatFrequency }) {
        try {
            const triggerDate = new Date(timestamp);
            if (triggerDate <= new Date()) return null;
            const trigger = repeatFrequency === 'weekly'
                ? { type: 'weekly', weekday: triggerDate.getDay() + 1, hour: triggerDate.getHours(), minute: triggerDate.getMinutes() }
                : { type: 'daily', hour: triggerDate.getHours(), minute: triggerDate.getMinutes() };
            return Notifications.scheduleNotificationAsync({
                content: { title, body, sound: true },
                trigger,
            });
        } catch (e) {
            console.log('Recurring notification error:', e);
            return null;
        }
    },

    async cancelNotification(id) {
        try {
            if (id) await Notifications.cancelScheduledNotificationAsync(id);
        } catch (e) {
            console.log('Cancel notification error:', e);
        }
    },

    async cancelAll() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (e) {
            console.log('Cancel all error:', e);
        }
    },
};
