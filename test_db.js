const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://scehoxxfeqwtbcyqcitv.supabase.co', 'sb_publishable_sGj1GDyRKCJWbKi9djwZcA_ZJf6bIab');

async function test() {
  try {
    const { data: settings, error: sErr } = await supabase.from('settings').select('*');
    console.log('--- SETTINGS ---');
    console.log(JSON.stringify(settings, null, 2));
    if (sErr) console.error('Settings Error:', sErr);

    const { data: tasks, error: tErr } = await supabase.from('tasks').select('id, title, priority, status, last_queued_at').limit(5);
    console.log('--- TASKS SAMPLE ---');
    console.log(JSON.stringify(tasks, null, 2));
    if (tErr) console.error('Tasks Error:', tErr);
  } catch (e) {
    console.error('Fatal Error:', e);
  }
}
test();
