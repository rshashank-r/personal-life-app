import useProfileStore from '../store/useProfileStore';
import taskService from '../../features/tasks/services/taskService';
import trackerService from '../../features/trackers/services/trackerService';
import memoryService from '../../features/memoryVault/services/memoryService';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'groq/compound';

export const aiService = {
    async generateLifeInsights() {
        const state = useProfileStore.getState();
        const apiKey = state.settings?.groq_api_key;

        if (!apiKey) {
            throw new Error('Groq API Key is not set. Please add it in Settings.');
        }

        // Gather context
        const profile = state.profile;
        const [pendingTasks, completedTasks, trackers, memories] = await Promise.all([
            taskService.getTodayDue(), // Assuming this returns today's tasks
            taskService.getTodayAllDue().then(res => res.filter(t => t.status === 'completed')),
            trackerService.getAllTodayStatus(),
            memoryService.getAll().then(m => m.slice(0, 5)) // Get latest 5 memories
        ]);

        const pendingList = pendingTasks.filter(t => t.status !== 'completed').map(t => t.title).join(', ');
        const completedList = completedTasks.map(t => t.title).join(', ');
        const habitsList = trackers.map(t => `${t.name} (Done: ${t.done ? 'Yes' : 'No'}, Streak: ${t.streak})`).join(', ');
        const memoriesList = memories.map(m => `"${m.title}": ${m.content}`).join(' | ');
        const prioritiesList = profile?.priorities ? JSON.parse(profile.priorities).join(', ') : 'None specified';

        const systemPrompt = `You are a highly intelligent, empathetic, and ruthlessly practical Personal AI Assistant.
The user is named ${profile?.name || 'User'}.
Their top life priorities are: ${prioritiesList}.

Your job is to analyze their day and give them a highly concise, powerful 3-paragraph life insight.
Paragraph 1: Validate what they have accomplished today and reflect on their current state.
Paragraph 2: Identify structural weaknesses in their habits or pending tasks that contradict their life priorities.
Paragraph 3: Give a highly specific, immediately actionable piece of advice for the rest of today to win the day.

Keep your tone direct, modern, and inspiring. Very important: Format your response using basic Markdown (bolding, italics, bullet points). DO NOT use overly long greetings.`;

        const userPrompt = `Here is my current life data for today:
- Pending Tasks: ${pendingList || 'None'}
- Completed Tasks Today: ${completedList || 'None'}
- Habits Status: ${habitsList || 'None'}
- Recent Memories/Notes: ${memoriesList || 'None'}

Please provide my insights.`;

        try {
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Groq API Error:", data);
                if (data.error && data.error.message.includes('Invalid API Key')) {
                    throw new Error('Your Groq API Key is invalid. Check Settings.');
                }
                throw new Error(data.error?.message || 'Failed to fetch insights from AI.');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    },

    async chatStream(messageHistory) {
        const state = useProfileStore.getState();
        const apiKey = state.settings?.groq_api_key;

        if (!apiKey) {
            throw new Error('Groq API Key is not set. Please add it in Settings.');
        }

        const profile = state.profile;
        const systemPrompt = `You are ${profile?.name || 'User'}'s Personal Assistant AI. Answer questions directly, concisely, and practically. Help them manage tasks, priorities, and life.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...messageHistory
        ];

        try {
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Chat failed.');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI Chat Error:', error);
            throw error;
        }
    }
};

export default aiService;
