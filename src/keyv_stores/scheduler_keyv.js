const Keyv = require('keyv');

const scheduler_keyv = new Keyv('sqlite://database.sqlite', { table: 'schedule', busyTimeout: 10000 });
scheduler_keyv.on('error', err => console.error('Keyv connection error:', err));

module.exports = scheduler_keyv;