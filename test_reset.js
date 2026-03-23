const { isTaskDueOn, processDailyTasks } = require('./dist/features/tasks/frequencyEngine');

// Mock data
const mockTasks = [
    {
        id: '1',
        title: 'Random High',
        priority: 'high',
        category: 'random',
        status: 'done',
        subSteps: [{ id: 's1', text: 'Step', status: 'done' }],
        createdAt: '2026-03-22T10:00:00Z',
        completions: 1
    },
    {
        id: '2',
        title: 'Dynamic Secondary',
        priority: 'secondary',
        category: 'dynamic',
        status: 'done',
        subSteps: [{ id: 's2', text: 'Step', status: 'done' }],
        createdAt: '2026-03-22T10:00:00Z',
        completions: 1
    },
    {
        id: '3',
        title: 'Primary Recurring',
        priority: 'primary',
        category: 'dynamic',
        frequency: 'daily',
        status: 'done',
        subSteps: [{ id: 's3', text: 'Step', status: 'done' }],
        createdAt: '2026-03-22T10:00:00Z',
        completions: 1
    }
];

console.log('--- TESTING RESET LOGIC ---');

const lastDate = '2026-03-22';
const curDate = '2026-03-23';

const results = processDailyTasks(mockTasks, lastDate, curDate);

results.forEach(t => {
    console.log(`Task: ${t.title}`);
    console.log(`- Status: ${t.status} (Expected: ${t.category === 'random' ? 'done' : 'pending'})`);
    console.log(`- SubStep Status: ${t.subSteps[0].status} (Expected: ${t.category === 'random' ? 'done' : 'pending'})`);
});

const isRandomDue = results[0].status === 'pending';
const isDynamicDue = results[1].status === 'pending';
const isPrimaryDue = results[2].status === 'pending';

if (!isRandomDue && isDynamicDue && isPrimaryDue) {
    console.log('\nSUCCESS: Random tasks stayed Done, Dynamic/Primary reset to Pending.');
} else {
    console.log('\nFAILURE: One or more tasks behaved incorrectly.');
}
